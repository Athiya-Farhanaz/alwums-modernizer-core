import requests
import json

API_KEY = "AIzaSyDnePBQUbQu_yawvRhS087yACs_6AWjBIc"
MODEL = "gemini-1.5-flash"
URL = f"https://generativelanguage.googleapis.com/v1/models/{MODEL}:generateContent?key={API_KEY}"

payload = {
    "contents": [{"role": "user", "parts": [{"text": "Say 'Hello World' in Python code."}]}]
}

resp = requests.post(URL, json=payload)
print(resp.status_code)
print(resp.text)