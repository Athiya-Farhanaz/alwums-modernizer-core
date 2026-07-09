#!/usr/bin/env python3
"""
universal_upgrader_server.py — Flask server wrapper for self-discovering MAS upgrader
Serves a simple API to upload a project zip, run the upgrade pipeline, and download the output as a zip.
Supports multiple API keys with automatic rotation on rate limits/errors.
"""

import os
import json
import time
import shutil
import subprocess
import requests
import re
import hashlib
from datetime import datetime
from flask import Flask, request, jsonify, send_file, abort, make_response
from werkzeug.utils import secure_filename
import zipfile
import tempfile
import threading
from dotenv import load_dotenv

# Load environment variables from .env file (resolved absolute path)
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# ---------- CONFIG ----------
# Load API Keys from GEMINI_API_KEY env variable, fallback to original hardcoded key if not specified
env_keys = os.environ.get("GEMINI_API_KEY", "")
if env_keys:
    API_KEYS = [k.strip() for k in env_keys.split(",") if k.strip()]
else:
    API_KEYS = []

api_key_index = 0  # Start with first key

MODEL = "gemini-2.5-flash"  # Stable modern model for July 2026
BASE_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"  # Using v1beta for model support
TEMPERATURE = 0.0

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AGENT_DIR = os.path.join(BASE_DIR, "agents")
CHECKPOINT_DIR = os.path.join(BASE_DIR, "checkpoints")
CACHE_FILE = os.path.join(CHECKPOINT_DIR, "llm_cache.json")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CHECKPOINT_DIR, exist_ok=True)
os.makedirs(AGENT_DIR, exist_ok=True)  # Ensure agents dir exists

ALLOWED_EXTENSIONS = {'zip'}  # Only allow zip uploads

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100 MB max upload size

# ---------- SIMPLE CACHE ----------
try:
    with open(CACHE_FILE, "r", encoding="utf-8") as f:
        _LLM_CACHE = json.load(f)
except:
    _LLM_CACHE = {}

def cache_get(key): return _LLM_CACHE.get(key)
def cache_set(key, value):
    _LLM_CACHE[key] = value
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(_LLM_CACHE, f, indent=2)

def make_key(prompt):
    return hashlib.sha256(prompt.encode("utf-8")).hexdigest()

# ---------- API KEY MANAGEMENT ----------
def get_base_url():
    global api_key_index
    if not API_KEYS:
        raise ValueError("No API keys configured")
    return BASE_URL_TEMPLATE.format(model=MODEL, key=API_KEYS[api_key_index])

def rotate_api_key():
    global api_key_index
    api_key_index = (api_key_index + 1) % len(API_KEYS)
    print(f"Switching to API key #{api_key_index+1} ({API_KEYS[api_key_index][:8]}...)")

# ---------- I/O helpers ----------
def read_file(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# ---------- markdown fence stripper ----------
def strip_markdown_fences(text):
    text = re.sub(r"```[^\n]*\n(.*?)```", lambda m: m.group(1), text, flags=re.S)
    return text.replace("```", "").strip()

# ---------- binary detector ----------
def is_binary_file(path):
    try:
        with open(path, "rb") as f:
            chunk = f.read(2048)
        return b'\0' in chunk
    except:
        return True

# ---------- LLM call with caching & backoff & key rotation ----------
def call_llm(prompt, retries=10, use_cache=True):
    key_hash = make_key(prompt)
    if use_cache:
        cached = cache_get(key_hash)
        if cached is not None:
            return cached

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": TEMPERATURE}
    }

    wait = 4
    for attempt in range(retries * len(API_KEYS)):  # tries all keys
        try:
            resp = requests.post(get_base_url(), json=payload, timeout=30)

            if resp.status_code == 429:  # rate limit
                print(f"Rate limit on key #{api_key_index+1} (Status 429), rotating... waiting {wait}s...")
                rotate_api_key()
                time.sleep(wait)
                wait = min(wait * 1.5, 30)
                continue

            if resp.status_code >= 500:  # server error
                print(f"Server error on key #{api_key_index+1} (Status {resp.status_code}), rotating... waiting {wait}s...")
                rotate_api_key()
                time.sleep(wait)
                wait = min(wait * 1.5, 30)
                continue

            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            text = strip_markdown_fences(text)
            cache_set(key_hash, text)
            return text

        except Exception as e:
            print(f"API call failed on key #{api_key_index+1} (Attempt {attempt+1}): {e}")
            rotate_api_key()
            time.sleep(wait)
            wait = min(wait * 2, 30)

    # If all keys fail:
    placeholder = "# [OFFLINE] LLM unavailable; skipping.\n"
    cache_set(key_hash, placeholder)
    return placeholder

# ---------- VALIDATORS ----------
def validator_output(path):
    ext = os.path.splitext(path)[1].lower()
    try:
        if ext == ".py":
            proc = subprocess.run(["python", "-m", "py_compile", path], capture_output=True, text=True, timeout=12)
            return (proc.returncode == 0, (proc.stdout + proc.stderr).strip())
        if ext == ".js" and shutil.which("node"):
            proc = subprocess.run(["node", "--check", path], capture_output=True, text=True, timeout=12)
            return (proc.returncode == 0, (proc.stdout + proc.stderr).strip())
        if ext == ".php" and shutil.which("php"):
            proc = subprocess.run(["php", "-l", path], capture_output=True, text=True, timeout=12)
            return (proc.returncode == 0, (proc.stdout + proc.stderr).strip())
    except Exception as e:
        return (False, str(e))
    return (True, "")

# ---------- detect language heuristically ----------
def detect_language(path, content):
    ext = os.path.splitext(path)[1].lower()
    mapping = {
        ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript", ".php": "PHP",
        ".html": "HTML", ".css": "CSS", ".java": "Java", ".rb": "Ruby",
    }
    if ext in mapping:
        return mapping[ext]
    if content.lstrip().startswith("#!"):
        shebang = content.splitlines()[0]
        if "python" in shebang: return "Python"
        if "node" in shebang or "nodejs" in shebang: return "JavaScript"
    if "<?php" in content: return "PHP"
    if "def " in content and "import " in content: return "Python"
    if "function " in content and "console.log" in content: return "JavaScript"
    return "Unknown"

# ---------- read agent templates ----------
def read_agent(name):
    path = os.path.join(AGENT_DIR, name)
    return read_file(path) if os.path.exists(path) else ""

# ---------- checkpoint helpers (per-run, in temp dir) ----------
def write_report_html(report, outpath):
    rows = ""
    for r in report:
        issues_html = "<br>".join(r["issues"]) if r["issues"] else "None"
        rows += f"<tr><td>{r['file']}</td><td>{r['status']}</td><td>{issues_html}</td><td>{r['time']}</td></tr>"
    html = f"<html><body><h2>MAS Upgrade Report</h2><table border='1' style='border-collapse:collapse'><tr><th>File</th><th>Status</th><th>Issues</th><th>Time(s)</th></tr>{rows}</table></body></html>"
    write_file(outpath, html)

# ---------- DISCOVERY ----------
def discovery_phase(all_files, discovery_agent_template, working_dir, batch_size=8):
    discoveries = {}
    file_payloads = []
    for full, rel in all_files:
        content = read_file(full)
        snippet = "\n".join(content.splitlines()[:200])
        lang = detect_language(rel, content)
        file_payloads.append({"rel": rel, "lang": lang, "snippet": snippet})

    for i in range(0, len(file_payloads), batch_size):
        batch = file_payloads[i:i+batch_size]
        prompt = discovery_agent_template + "\n\nFILES:\n"
        for f in batch:
            prompt += f"---FILE_START: {f['rel']} (LANG: {f['lang']})---\n{f['snippet']}\n---FILE_END---\n\n"
        prompt += "\nInstructions: For each file above, return a JSON object mapping filename to either 'NO_ISSUES' or a short list of issues (strings). Return ONLY valid JSON."
        resp = call_llm(prompt)
        parsed = {}
        try:
            obj_text = resp.strip()
            first_brace = obj_text.find('{')
            last_brace = obj_text.rfind('}')
            if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                json_text = obj_text[first_brace:last_brace+1]
                parsed = json.loads(json_text)
        except:
            lines = resp.splitlines()
            for line in lines:
                if ":" in line:
                    parts = line.split(":", 1)
                    name = parts[0].strip().strip('"')
                    val = parts[1].strip()
                    parsed[name] = val or "NO_ISSUES"
        for f in batch:
            key = f["rel"]
            discoveries[key] = parsed.get(key, parsed.get(os.path.basename(key), "NO_ISSUES"))
    return discoveries

# ---------- extract related snippets ----------
def extract_related_snippets(target_rel, all_files, max_chars=800):
    tokens = set(re.findall(r"[A-Za-z_]\w+", os.path.basename(target_rel)))
    snippets = []
    chars = 0
    for full, rel in all_files:
        if rel == target_rel: continue
        if os.path.dirname(rel) == os.path.dirname(target_rel) or os.path.splitext(rel)[1] == os.path.splitext(target_rel)[1]:
            txt = read_file(full)
            headers = re.findall(r"^(?:class|def|function|const|var|let|public|private|protected).{0,200}", txt, re.M)
            related = []
            for t in list(tokens)[:4]:
                for m in re.finditer(r".{0,120}\b" + re.escape(t) + r"\b.{0,120}", txt, re.S):
                    related.append(m.group(0).strip())
            chosen = (headers + related)[:6]
            for c in chosen:
                if c and chars < max_chars:
                    snippets.append(c.strip())
                    chars += len(c)
    seen, out = [], []
    for s in snippets:
        if s not in seen:
            out.append(s); seen.append(s)
    return "\n".join(out)[:max_chars]

# ---------- Pipeline (extracted to function) ----------
def run_upgrade_pipeline(input_dir, output_dir, report_dir):
    discovery_template = read_agent("discovery_agent.txt")
    manager_template = read_agent("manager.txt")
    maker_template = read_agent("pipeline_prompt_maker.txt")
    exec_template = read_agent("pipeline_prompt_executioner.txt")
    final_template = read_agent("finalizer.txt")

    if not discovery_template or not manager_template:
        raise ValueError("Missing agent templates in 'agents/' directory. Ensure files like discovery_agent.txt exist.")

    all_files = []
    for root, _, files in os.walk(input_dir):
        for f in files:
            full = os.path.join(root, f)
            if is_binary_file(full): continue
            rel = os.path.relpath(full, input_dir)
            all_files.append((full, rel))

    if not all_files:
        raise ValueError("No text files found in uploaded project.")

    report = []
    print("Running discovery phase...")
    discoveries = discovery_phase(all_files, discovery_template, input_dir, batch_size=6)
    requirements = {k: v for k, v in discoveries.items() if not (isinstance(v, str) and v.strip().upper() in ("NO_ISSUES", "NONE"))}
    print(f"Discovery found {len(requirements)} files with potential issues.")

    project_context = "\n".join([rel for _, rel in all_files[:40]])

    for full, rel in all_files:
        discovered = discoveries.get(rel, "NO_ISSUES")
        code_content = read_file(full)
        lang = detect_language(rel, code_content)

        # Manager
        if isinstance(discovered, str) and discovered.strip().upper() in ("NO_ISSUES", "NONE"):
            manager_prompt = manager_template.replace("PROJECT_CONTEXT", project_context) \
                                             .replace("FILE_NAME", rel) \
                                             .replace("CODE_CONTENT", code_content) \
                                             .replace("AUTOMATED_FINDINGS", "NO_ISSUES")
        else:
            manager_prompt = manager_template.replace("PROJECT_CONTEXT", project_context) \
                                             .replace("FILE_NAME", rel) \
                                             .replace("CODE_CONTENT", code_content) \
                                             .replace("AUTOMATED_FINDINGS", discovered if isinstance(discovered, str) else json.dumps(discovered))
        manager_resp = call_llm(manager_prompt)
        if manager_resp and "NO UPGRADE NEEDED" in manager_resp.upper():
            dest_path = os.path.join(output_dir, rel)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            shutil.copy2(full, dest_path)
            report.append({"file": rel, "status": "Pass", "issues": ["No upgrade needed"], "time": 0})
            continue

        tasks_text = manager_resp.strip()

        # Maker
        maker_prompt = maker_template.replace("PROJECT_CONTEXT", project_context) \
                                     .replace("FILE_CONTEXT", f"{rel} ({lang})") \
                                     .replace("TASK", tasks_text)
        maker_out = call_llm(maker_prompt)
        if maker_out and maker_out.strip().upper() == "NO UPGRADE NEEDED":
            dest_path = os.path.join(output_dir, rel)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            shutil.copy2(full, dest_path)
            report.append({"file": rel, "status": "Pass", "issues": ["No upgrade needed"], "time": 0})
            continue

        # Executioner
        snippets = extract_related_snippets(rel, all_files, max_chars=800)
        exec_prompt = exec_template.replace("PROJECT_CONTEXT", project_context) \
                                   .replace("RELATED_SNIPPETS", snippets) \
                                   .replace("FILE_NAME", rel) \
                                   .replace("CODE_CONTENT", code_content) \
                                   .replace("PROMPT", maker_out)
        new_code = call_llm(exec_prompt)
        out_path = os.path.join(output_dir, rel)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        write_file(out_path, new_code)

        # Validator & Finalizer
        status = "Pass"; issues = []; start = time.time()
        for attempt in range(3):
            ok, out = validator_output(out_path)
            if ok:
                break
            else:
                final_prompt = final_template.replace("OLD_CODE", code_content) \
                                             .replace("CODE_CONTENT", read_file(out_path)) \
                                             .replace("REMARKS", out)
                fixed = call_llm(final_prompt, use_cache=False)
                write_file(out_path, fixed)
                if attempt == 2:
                    status = "Fail"; issues.append("Self-test failed after finalizer attempts")
        elapsed = round(time.time() - start, 2)
        report.append({"file": rel, "status": status, "issues": issues, "time": elapsed})

    # Write report
    report_path = os.path.join(report_dir, "report.html")
    write_report_html(report, report_path)
    return report_path

# ---------- Helper to create output zip ----------
def create_output_zip(output_dir, report_path):
    zip_path = output_dir + ".zip"
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as src_zipf:
        for root, _, files in os.walk(output_dir):
            for file in files:
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, output_dir)
                src_zipf.write(full_path, "output_code/" + arcname)
        src_zipf.write(report_path, "report.html")
    
    # Read into memory
    with open(zip_path, 'rb') as f:
        zip_bytes = f.read()
    
    # Delete the file early
    os.remove(zip_path)
    return zip_bytes

# ---------- Flask Routes ----------
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upgrade', methods=['POST', 'OPTIONS'])
def upgrade_project():
    if request.method == 'OPTIONS':
        return _build_cors_response("")
    
    if 'project' not in request.files:
        return _cors_jsonify({"error": "No project file uploaded"}), 400
    file = request.files['project']
    if file.filename == '' or not allowed_file(file.filename):
        return _cors_jsonify({"error": "Invalid file, must be a .zip"}), 400

    # Create temp dirs for this run
    with tempfile.TemporaryDirectory() as temp_base:
        input_dir = os.path.join(temp_base, "input")
        output_dir = os.path.join(temp_base, "output")
        report_dir = os.path.join(temp_base, "reports")
        os.makedirs(input_dir, exist_ok=True)
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs(report_dir, exist_ok=True)

        # Save and extract zip
        zip_path = os.path.join(temp_base, secure_filename(file.filename))
        file.save(zip_path)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(input_dir)

        # Run pipeline
        try:
            report_path = run_upgrade_pipeline(input_dir, output_dir, report_dir)
            zip_bytes = create_output_zip(output_dir, report_path)
            
            response = make_response(zip_bytes)
            response.headers['Content-Type'] = 'application/zip'
            response.headers['Content-Disposition'] = 'attachment; filename=upgraded_project.zip'
            return _build_cors_response(response)
        except Exception as e:
            return _cors_jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    try:
        with open(os.path.join(BASE_DIR, "index.html"), "r", encoding="utf-8") as f:
            return f.read(), 200, {'Content-Type': 'text/html; charset=utf-8'}
    except Exception as e:
        return f"Failed to load index.html: {str(e)}", 404

@app.route('/index.css')
def serve_css():
    try:
        with open(os.path.join(BASE_DIR, "index.css"), "r", encoding="utf-8") as f:
            return f.read(), 200, {'Content-Type': 'text/css; charset=utf-8'}
    except Exception as e:
        return f"Failed to load index.css: {str(e)}", 404

@app.route('/index.js')
def serve_js():
    try:
        with open(os.path.join(BASE_DIR, "index.js"), "r", encoding="utf-8") as f:
            return f.read(), 200, {'Content-Type': 'application/javascript; charset=utf-8'}
    except Exception as e:
        return f"Failed to load index.js: {str(e)}", 404

@app.route('/health', methods=['GET', 'OPTIONS'])
def health():
    if request.method == 'OPTIONS':
        return _build_cors_response("")
    response = jsonify({"status": "ok"})
    return _build_cors_response(response), 200

@app.route('/debug', methods=['GET', 'OPTIONS'])
def debug():
    if request.method == 'OPTIONS':
        return _build_cors_response("")
    response = jsonify({
        "api_keys_count": len(API_KEYS),
        "api_keys_preview": [k[:6] + "..." for k in API_KEYS] if API_KEYS else [],
        "cache_file_path": CACHE_FILE,
        "cache_keys_count": len(_LLM_CACHE),
        "cache_keys": list(_LLM_CACHE.keys()),
        "base_dir": BASE_DIR,
        "gemini_env_key": os.environ.get("GEMINI_API_KEY", "")[:6] + "..." if os.environ.get("GEMINI_API_KEY") else "None"
    })
    return _build_cors_response(response), 200

# CORS Helpers
def _build_cors_response(response_or_str):
    if isinstance(response_or_str, str):
        response = make_response(response_or_str)
    else:
        response = response_or_str
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Max-Age'] = '3600'
    return response

def _cors_jsonify(*args, **kwargs):
    response = jsonify(*args, **kwargs)
    return _build_cors_response(response)

if __name__ == "__main__":
    print("Starting Flask server. Ensure agent templates are in 'agents/' and API_KEYS are set.")
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)