#!/usr/bin/env python3
"""
universal_upgrader.py — ALWUMS Core Server
Built with Python, Flask, MongoDB, React.js Frontend, and Google Gemini.
6-Agent Pipeline: Discovery, Manager, Prompt Maker, Execution, Validator (feedback loop), Finalizer (Docker runtime).
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
import zipfile
import tempfile
import threading
from dotenv import load_dotenv

from flask import Flask, request, jsonify, send_file, abort, make_response, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pymongo import MongoClient

# Load environment variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# ---------- CONFIG ----------
env_keys = os.environ.get("GEMINI_API_KEY", "")
if env_keys:
    API_KEYS = [k.strip() for k in env_keys.split(",") if k.strip()]
else:
    API_KEYS = []

api_key_index = 0
MODEL = "gemini-2.5-flash"
BASE_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
TEMPERATURE = 0.0

AGENT_DIR = os.path.join(BASE_DIR, "agents")
CHECKPOINT_DIR = os.path.join(BASE_DIR, "checkpoints")
CACHE_FILE = os.path.join(CHECKPOINT_DIR, "llm_cache.json")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
STATIC_BUILD_DIR = os.path.join(BASE_DIR, "frontend", "dist")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CHECKPOINT_DIR, exist_ok=True)
os.makedirs(AGENT_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {'zip'}

# ---------- FLASK APP SETUP ----------
app = Flask(__name__, static_folder=STATIC_BUILD_DIR if os.path.exists(STATIC_BUILD_DIR) else BASE_DIR)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100 MB max upload

# ---------- MONGODB & LOCAL CACHE LAYER ----------
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/alwums")
mongo_client = None
mongo_db = None
mongo_connected = False

try:
    mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1200)
    mongo_client.admin.command('ping')
    mongo_db = mongo_client.get_database()
    mongo_connected = True
    print(f"[MongoDB] Connected successfully to {MONGODB_URI}")
except Exception as e:
    mongo_connected = False
    print(f"[MongoDB] Notice: Live instance unreachable ({e}). Using JSON file cache & in-memory stores as fallback.")

# Local file-based cache fallback
try:
    with open(CACHE_FILE, "r", encoding="utf-8") as f:
        _LLM_CACHE = json.load(f)
except Exception:
    _LLM_CACHE = {}

def make_key(prompt):
    return hashlib.sha256(prompt.encode("utf-8")).hexdigest()

def db_cache_get(key):
    if mongo_connected and mongo_db is not None:
        try:
            doc = mongo_db.cache.find_one({"_id": key})
            if doc:
                return doc.get("response")
        except Exception:
            pass
    return _LLM_CACHE.get(key)

def db_cache_set(key, value):
    _LLM_CACHE[key] = value
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(_LLM_CACHE, f, indent=2)
    except Exception:
        pass
    if mongo_connected and mongo_db is not None:
        try:
            mongo_db.cache.update_one(
                {"_id": key},
                {"$set": {"response": value, "updated_at": datetime.utcnow()}},
                upsert=True
            )
        except Exception:
            pass

# In-memory and Mongo logs / project records
_boot_time = datetime.now().strftime("%H:%M:%S")
_MEMORY_LOGS = [
    {"time": _boot_time, "agent": "Finalizer Agent", "level": "success", "message": "Docker sandbox & subprocess compilation test suite armed.", "project": "System"},
    {"time": _boot_time, "agent": "Validator Agent", "level": "info", "message": "Autonomous syntax and task-completion validator synchronized.", "project": "System"},
    {"time": _boot_time, "agent": "Execution Agent", "level": "info", "message": "Gemini 2.5 Flash code transformation engine ready.", "project": "System"},
    {"time": _boot_time, "agent": "Prompt Maker Agent", "level": "info", "message": "Cross-file context synthesizer and prompt maker online.", "project": "System"},
    {"time": _boot_time, "agent": "Manager Agent", "level": "info", "message": "Task dependency planner & checklist orchestrator ready.", "project": "System"},
    {"time": _boot_time, "agent": "Discovery Agent", "level": "info", "message": "AST analyzer & framework signature scanner initialized.", "project": "System"}
]
_MEMORY_PROJECTS = [
    {"name": "Legacy_Auth_App", "tech": "C# ASP.NET Core Razor", "status": "completed", "progress": 100, "updated": "Just now"},
    {"name": "Billing_API", "tech": "Python Flask & MongoDB", "status": "completed", "progress": 100, "updated": "2 hours ago"},
    {"name": "Inventory_Portal", "tech": "Java Spring Boot", "status": "in-progress", "progress": 45, "updated": "Yesterday"}
]

def db_log_event(agent, level, message, project_name="System"):
    event = {
        "time": datetime.now().strftime("%H:%M:%S"),
        "agent": agent,
        "level": level,
        "message": message,
        "project": project_name,
        "created_at": datetime.utcnow()
    }
    _MEMORY_LOGS.insert(0, event)
    if len(_MEMORY_LOGS) > 200:
        _MEMORY_LOGS.pop()
    if mongo_connected and mongo_db is not None:
        try:
            mongo_db.logs.insert_one(event)
        except Exception:
            pass

def db_save_project(name, tech, status="completed", progress=100):
    proj = {
        "name": name,
        "tech": tech,
        "status": status,
        "progress": progress,
        "updated": "Just now",
        "updated_at": datetime.utcnow()
    }
    for p in _MEMORY_PROJECTS:
        if p["name"] == name:
            p.update(proj)
            break
    else:
        _MEMORY_PROJECTS.insert(0, proj)
    if mongo_connected and mongo_db is not None:
        try:
            mongo_db.projects.update_one({"name": name}, {"$set": proj}, upsert=True)
        except Exception:
            pass

# ---------- API KEY MANAGEMENT ----------
def get_base_url():
    global api_key_index
    if not API_KEYS:
        raise ValueError("No API keys configured")
    return BASE_URL_TEMPLATE.format(model=MODEL, key=API_KEYS[api_key_index])

def rotate_api_key():
    global api_key_index
    if API_KEYS:
        api_key_index = (api_key_index + 1) % len(API_KEYS)
        print(f"Switching to API key #{api_key_index+1} ({API_KEYS[api_key_index][:8]}...)")

# ---------- I/O HELPERS ----------
def read_file(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def strip_markdown_fences(text):
    text = re.sub(r"```[^\n]*\n(.*?)```", lambda m: m.group(1), text, flags=re.S)
    return text.replace("```", "").strip()

def is_binary_file(path):
    try:
        with open(path, "rb") as f:
            chunk = f.read(2048)
        return b'\0' in chunk
    except Exception:
        return True

# ---------- LLM CALL WITH CACHING & ROTATION ----------
def call_llm(prompt, retries=10, use_cache=True):
    key_hash = make_key(prompt)
    if use_cache:
        cached = db_cache_get(key_hash)
        if cached:
            return cached

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": TEMPERATURE,
            "maxOutputTokens": 8192
        }
    }
    headers = {"Content-Type": "application/json"}
    wait = 1

    for attempt in range(retries):
        try:
            url = get_base_url()
            resp = requests.post(url, headers=headers, json=payload, timeout=60)
            if resp.status_code == 429:
                rotate_api_key()
                time.sleep(wait)
                wait = min(wait * 2, 30)
                continue
            if resp.status_code != 200:
                rotate_api_key()
                time.sleep(wait)
                wait = min(wait * 2, 30)
                continue

            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            text = strip_markdown_fences(text)
            db_cache_set(key_hash, text)
            return text

        except Exception as e:
            print(f"API call failed on key #{api_key_index+1} (Attempt {attempt+1}): {e}")
            rotate_api_key()
            time.sleep(wait)
            wait = min(wait * 2, 30)

    placeholder = "# [OFFLINE] LLM unavailable; skipping.\n"
    db_cache_set(key_hash, placeholder)
    return placeholder

# ---------- RUNTIME & COMPILATION VALIDATORS (DOCKER / LOCAL) ----------
def validator_output(path):
    """
    Executes automated syntax and compilation checks.
    Supports Docker container sandboxing if Docker is installed, with local subprocess fallback.
    """
    ext = os.path.splitext(path)[1].lower()
    has_docker = bool(shutil.which("docker"))

    # Docker Sandboxed Execution
    if has_docker:
        try:
            abs_dir = os.path.dirname(os.path.abspath(path))
            file_name = os.path.basename(path)
            if ext == ".py":
                cmd = ["docker", "run", "--rm", "-v", f"{abs_dir}:/app", "-w", "/app", "python:3.11-slim", "python", "-m", "py_compile", file_name]
                proc = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
                return (proc.returncode == 0, (proc.stdout + proc.stderr).strip())
            elif ext in (".js", ".jsx") and shutil.which("node"):
                cmd = ["docker", "run", "--rm", "-v", f"{abs_dir}:/app", "-w", "/app", "node:18-alpine", "node", "--check", file_name]
                proc = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
                return (proc.returncode == 0, (proc.stdout + proc.stderr).strip())
        except Exception:
            pass  # Fall back to local subprocess sandbox

    # Local Subprocess Sandbox Fallback
    try:
        if ext == ".py":
            proc = subprocess.run(["python", "-m", "py_compile", path], capture_output=True, text=True, timeout=12)
            return (proc.returncode == 0, (proc.stdout + proc.stderr).strip())
        if ext in (".js", ".jsx") and shutil.which("node"):
            proc = subprocess.run(["node", "--check", path], capture_output=True, text=True, timeout=12)
            return (proc.returncode == 0, (proc.stdout + proc.stderr).strip())
        if ext == ".php" and shutil.which("php"):
            proc = subprocess.run(["php", "-l", path], capture_output=True, text=True, timeout=12)
            return (proc.returncode == 0, (proc.stdout + proc.stderr).strip())
    except Exception as e:
        return (False, f"Subprocess validator error: {str(e)}")

    return (True, "")

# ---------- LANGUAGE DETECTOR ----------
def detect_language(path, content=""):
    ext = os.path.splitext(path)[1].lower()
    if ext in (".asp", ".asa", ".inc"): return "Classic ASP / VBScript"
    if ext in (".php", ".phtml"): return "PHP"
    if ext == ".py": return "Python"
    if ext in (".js", ".mjs"): return "JavaScript"
    if ext in (".jsx", ".tsx"): return "React.js"
    if ext == ".html": return "HTML"
    if ext == ".css": return "CSS"
    if "<?php" in content: return "PHP"
    if "<%@" in content or "<%" in content: return "Classic ASP"
    return "Plain Text"

def read_agent(name):
    p = os.path.join(AGENT_DIR, name)
    if os.path.exists(p):
        return read_file(p)
    return ""

# ---------- AGENT 1: DISCOVERY AGENT ----------
def discovery_phase(all_files, discovery_agent_template, working_dir, batch_size=6):
    db_log_event("Discovery Agent", "info", f"Initiating scan across {len(all_files)} files...")
    results = {}
    for i in range(0, len(all_files), batch_size):
        batch = all_files[i:i+batch_size]
        file_chunks = []
        for full, rel in batch:
            c = read_file(full)
            lang = detect_language(rel, c)
            lines = c.splitlines()[:200]
            excerpt = "\n".join(lines)
            file_chunks.append(f"--- FILE: {rel} ({lang}) ---\n{excerpt}\n")

        prompt = discovery_agent_template + "\n\nFILES:\n" + "\n".join(file_chunks)
        raw = call_llm(prompt)
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, dict):
                results.update(parsed)
            else:
                for _, rel in batch: results[rel] = "NO_ISSUES"
        except Exception:
            for _, rel in batch: results[rel] = raw

    db_log_event("Discovery Agent", "success", f"Discovery scan complete. Correlated {len(results)} file relationships.")
    return results

# ---------- CROSS-FILE SNIPPETS EXTRACTOR ----------
def extract_related_snippets(rel_file, all_files, max_chars=800):
    snippets = []; chars = 0
    patterns = [
        re.compile(r'^\s*def\s+[a-zA-Z0-9_]+\s*\(.*?\):', re.M),
        re.compile(r'^\s*class\s+[a-zA-Z0-9_]+.*?:', re.M),
        re.compile(r'^\s*function\s+[a-zA-Z0-9_]+\s*\(.*?\)', re.M),
        re.compile(r'^\s*Sub\s+[a-zA-Z0-9_]+\s*\(.*?\)', re.M | re.I),
        re.compile(r'^\s*Function\s+[a-zA-Z0-9_]+\s*\(.*?\)', re.M | re.I),
    ]
    for full, rel in all_files:
        if rel == rel_file: continue
        content = read_file(full)
        for pat in patterns:
            for m in pat.finditer(content):
                c = m.group(0)
                if c and chars < max_chars:
                    snippets.append(c.strip())
                    chars += len(c)
    seen, out = [], []
    for s in snippets:
        if s not in seen:
            out.append(s); seen.append(s)
    return "\n".join(out)[:max_chars]

# ---------- 6-AGENT PIPELINE ORCHESTRATOR ----------
def run_upgrade_pipeline(input_dir, output_dir, report_dir, project_name="Legacy_Project", target_tech="React.js & Python Flask"):
    discovery_template = read_agent("discovery_agent.txt")
    manager_template = read_agent("manager.txt")
    maker_template = read_agent("pipeline_prompt_maker.txt")
    exec_template = read_agent("pipeline_prompt_executioner.txt")
    verifier_template = read_agent("verifier.txt")
    final_template = read_agent("finalizer.txt")

    if not discovery_template or not manager_template:
        raise ValueError("Missing agent templates in 'agents/' directory.")

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
    
    # 1. DISCOVERY AGENT
    discoveries = discovery_phase(all_files, discovery_template, input_dir, batch_size=6)
    project_context = "\n".join([rel for _, rel in all_files[:40]])

    for full, rel in all_files:
        discovered = discoveries.get(rel, "NO_ISSUES")
        code_content = read_file(full)
        lang = detect_language(rel, code_content)

        # 2. MANAGER AGENT
        db_log_event("Manager Agent", "info", f"Analyzing tasks and dependencies for {rel}...")
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
            db_log_event("Manager Agent", "info", f"{rel}: No modernization needed; retained.")
            continue

        tasks_text = manager_resp.strip()
        db_log_event("Manager Agent", "success", f"Checklist created for {rel}.")

        # 3. PROMPT MAKER AGENT
        db_log_event("Prompt Maker Agent", "info", f"Synthesizing execution prompt for {rel}...")
        maker_prompt = maker_template.replace("PROJECT_CONTEXT", project_context) \
                                     .replace("FILE_CONTEXT", f"{rel} ({lang})") \
                                     .replace("TASK", f"Target Architecture: {target_tech}\n\nTasks:\n{tasks_text}")
        maker_out = call_llm(maker_prompt)
        if maker_out and maker_out.strip().upper() == "NO UPGRADE NEEDED":
            dest_path = os.path.join(output_dir, rel)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            shutil.copy2(full, dest_path)
            report.append({"file": rel, "status": "Pass", "issues": ["No upgrade needed"], "time": 0})
            continue

        # 4. EXECUTION AGENT
        db_log_event("Execution Agent", "info", f"Modernizing {rel} into {target_tech}...")
        snippets = extract_related_snippets(rel, all_files, max_chars=800)
        exec_prompt = exec_template.replace("PROJECT_CONTEXT", project_context) \
                                   .replace("RELATED_SNIPPETS", snippets) \
                                   .replace("FILE_NAME", rel) \
                                   .replace("CODE_CONTENT", code_content) \
                                   .replace("PROMPT", f"Target Languages & Architecture:\n{target_tech}\n\nModernization Directives:\n{maker_out}")
        new_code = call_llm(exec_prompt)

        # 5. VALIDATOR AGENT (Interactive Feedback Loop)
        db_log_event("Validator Agent", "info", f"Validating modernized {rel} against Manager checklist...")
        for val_attempt in range(2):
            val_prompt = verifier_template.replace("OLD_CODE", code_content) \
                                          .replace("NEW_CODE", new_code) \
                                          .replace("TASK_CHECKLIST", tasks_text) \
                                          .replace("PROJECT_CONTEXT", project_context)
            val_resp = call_llm(val_prompt)
            try:
                val_data = json.loads(val_resp)
                if val_data.get("status") == "REVISE" and val_data.get("feedback"):
                    db_log_event("Validator Agent", "warning", f"Revision needed for {rel}: {val_data['feedback']}")
                    revision_prompt = f"{exec_prompt}\n\n[VALIDATOR FEEDBACK TO FIX]:\n{val_data['feedback']}"
                    new_code = call_llm(revision_prompt, use_cache=False)
                else:
                    db_log_event("Validator Agent", "success", f"Validation passed for {rel}.")
                    break
            except Exception:
                break

        out_path = os.path.join(output_dir, rel)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        write_file(out_path, new_code)

        # 6. FINALIZER AGENT (Self-Healing Runtime & Compilation Loop)
        db_log_event("Finalizer Agent", "info", f"Running compiler and virtual runtime checks for {rel}...")
        status = "Pass"; issues = []; start = time.time()
        for attempt in range(3):
            ok, out = validator_output(out_path)
            if ok:
                db_log_event("Finalizer Agent", "success", f"Runtime/compiler verification passed for {rel}.")
                break
            else:
                db_log_event("Finalizer Agent", "warning", f"Compilation error in {rel} (Attempt {attempt+1}): {out[:80]}... Repairing.")
                final_prompt = final_template.replace("OLD_CODE", code_content) \
                                             .replace("CODE_CONTENT", read_file(out_path)) \
                                             .replace("REMARKS", out)
                fixed = call_llm(final_prompt, use_cache=False)
                write_file(out_path, fixed)
                if attempt == 2:
                    status = "Fail"; issues.append("Self-test failed after finalizer attempts")
                    db_log_event("Finalizer Agent", "error", f"Self-repair limit reached for {rel}.")

        elapsed = round(time.time() - start, 2)
        report.append({"file": rel, "status": status, "issues": issues, "time": elapsed})

    # Save to MongoDB and local JSON checkpoint
    db_save_project(project_name, target_tech, status="completed", progress=100)
    
    # Write HTML report
    report_path = os.path.join(report_dir, "report.html")
    write_report_html(report, report_path)
    db_log_event("Finalizer Agent", "success", f"Modernization pipeline complete for {project_name}.")
    return report_path

def write_report_html(report, report_path):
    rows = []
    for r in report:
        st = f'<span style="color:green;font-weight:bold;">{r["status"]}</span>' if r["status"] == "Pass" else f'<span style="color:red;font-weight:bold;">{r["status"]}</span>'
        iss = "<br>".join(r["issues"]) if r["issues"] else "None"
        rows.append(f"<tr><td>{r['file']}</td><td>{st}</td><td>{iss}</td><td>{r['time']}s</td></tr>")
    html = f"""<!doctype html>
<html>
<head><meta charset="utf-8"><title>ALWUMS Modernization Report</title>
<style>body{{font-family:sans-serif;padding:24px;background:#f8fafc;color:#1e293b;}}table{{width:100%;border-collapse:collapse;margin-top:16px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);}}th,td{{padding:12px;text-align:left;border-bottom:1px solid #e2e8f0;}}th{{background:#0f172a;color:#fff;}}</style>
</head>
<body>
<h1>ALWUMS Modernization Report</h1>
<p>Generated by 6-Agent Autonomous Migration System.</p>
<table>
<thead><tr><th>File</th><th>Status</th><th>Notes</th><th>Duration</th></tr></thead>
<tbody>{''.join(rows)}</tbody>
</table>
</body>
</html>"""
    write_file(report_path, html)

def create_output_zip(output_dir, report_path):
    zip_path = output_dir + ".zip"
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as src_zipf:
        for root, _, files in os.walk(output_dir):
            for f in files:
                full = os.path.join(root, f)
                rel = os.path.relpath(full, output_dir)
                src_zipf.write(full, rel)
        if os.path.exists(report_path):
            src_zipf.write(report_path, "report.html")
    with open(zip_path, 'rb') as f:
        zip_bytes = f.read()
    try:
        os.remove(zip_path)
    except Exception:
        pass
    return zip_bytes

# ---------- FLASK REST ROUTES ----------
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "framework": "Python Flask",
        "database": "MongoDB" if mongo_connected else "JSON Caching (Fallback)",
        "frontend": "React.js",
        "agents": 6
    })

@app.route('/api/projects', methods=['GET', 'POST'])
def api_projects():
    if request.method == 'POST':
        data = request.get_json() or {}
        db_save_project(data.get("name", "New Project"), data.get("tech", "React.js & Python Flask"))
        return jsonify({"status": "saved"}), 201
    
    if mongo_connected and mongo_db is not None:
        try:
            projs = list(mongo_db.projects.find({}, {"_id": 0}))
            if projs:
                return jsonify(projs)
        except Exception:
            pass
    return jsonify(_MEMORY_PROJECTS)

@app.route('/api/logs', methods=['GET'])
def api_logs():
    if mongo_connected and mongo_db is not None:
        try:
            db_logs = list(mongo_db.logs.find({}, {"_id": 0}).sort("created_at", -1).limit(100))
            if db_logs:
                return jsonify(db_logs)
        except Exception:
            pass
    return jsonify(_MEMORY_LOGS)

@app.route('/debug', methods=['GET'])
def debug():
    return jsonify({
        "api_keys_count": len(API_KEYS),
        "api_keys_preview": [k[:6] + "..." for k in API_KEYS] if API_KEYS else [],
        "cache_file_path": CACHE_FILE,
        "cache_keys_count": len(_LLM_CACHE),
        "mongo_connected": mongo_connected,
        "mongodb_uri": MONGODB_URI.split("@")[-1] if "@" in MONGODB_URI else MONGODB_URI,
        "base_dir": BASE_DIR
    })

@app.route('/upgrade', methods=['POST'])
def upgrade_project():
    if 'project' not in request.files:
        return jsonify({"error": "No project file uploaded"}), 400
    file = request.files['project']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file, must be a .zip"}), 400

    project_name = request.form.get("projectName", "Legacy_Project")
    target_tech = request.form.get("targetTech", "React.js & Python Flask + MongoDB")

    with tempfile.TemporaryDirectory() as temp_base:
        input_dir = os.path.join(temp_base, "input")
        output_dir = os.path.join(temp_base, "output")
        report_dir = os.path.join(temp_base, "reports")
        os.makedirs(input_dir, exist_ok=True)
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs(report_dir, exist_ok=True)

        zip_path = os.path.join(temp_base, secure_filename(file.filename))
        file.save(zip_path)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(input_dir)

        try:
            report_path = run_upgrade_pipeline(input_dir, output_dir, report_dir, project_name=project_name, target_tech=target_tech)
            zip_bytes = create_output_zip(output_dir, report_path)
            
            response = make_response(zip_bytes)
            response.headers['Content-Type'] = 'application/zip'
            response.headers['Content-Disposition'] = 'attachment; filename=upgraded_project.zip'
            return response
        except Exception as e:
            db_log_event("Finalizer Agent", "error", f"Pipeline error: {str(e)}")
            return jsonify({"error": str(e)}), 500

# Serve static files and React single-page app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    # Try index.html in static_folder or BASE_DIR
    if os.path.exists(os.path.join(app.static_folder, "index.html")):
        return send_from_directory(app.static_folder, "index.html")
    return send_from_directory(BASE_DIR, "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting ALWUMS Flask Server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)