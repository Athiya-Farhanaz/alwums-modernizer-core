import React, { useState } from 'react';

const SAMPLE_FILES = {
  'LoginComponent.jsx': {
    original: `<%@ Language="VBScript" %>
<html>
<head><title>User Login</title></head>
<body>
<%
  Dim conn, rs, sql, user
  user = Request.Form("username")
  Set conn = Server.CreateObject("ADODB.Connection")
  conn.Open "DSN=LegacyDB;Uid=admin;Pwd=secret;"
  sql = "SELECT * FROM Users WHERE Username = '" & user & "'"
  Set rs = conn.Execute(sql)
%>
  <form method="POST" action="login.asp">
    <input type="text" name="username" />
    <input type="password" name="password" />
    <input type="submit" value="Sign In" />
  </form>
</body>
</html>`,
    modernized: `import React, { useState } from 'react';
import axios from 'axios';

// Upgraded from Classic ASP VBScript into React.js functional component
export default function LoginComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Secure REST API call to Python Flask + MongoDB backend
      const res = await axios.post('/api/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="login-card">
      <h2>Sign In</h2>
      {error && <div className="error-alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" className="btn-primary">Sign In</button>
      </form>
    </div>
  );
}`
  },
  'auth_routes.py': {
    original: `// Legacy PHP Query with direct concatenation
$user = $_POST['username'];
$pass = $_POST['password'];
$link = mysql_connect('localhost', 'root', 'root');
mysql_select_db('users_db', $link);
$res = mysql_query("SELECT * FROM members WHERE user = '$user'");
$row = mysql_fetch_assoc($res);`,
    modernized: `# Modernized Python Flask REST Controller with MongoDB
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import bcrypt

auth_bp = Blueprint('auth', __name__)
client = MongoClient("mongodb://localhost:27017/alwums")
db = client.get_database()

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    # Secure NoSQL MongoDB query preventing SQL injection
    user_doc = db.users.find_one({"username": username})
    if not user_doc or not bcrypt.checkpw(password.encode(), user_doc['password_hash']):
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({"status": "success", "user": username})`
  }
};

export default function DiffViewer({ customFiles }) {
  const allFiles = { ...SAMPLE_FILES, ...(customFiles || {}) };
  const fileKeys = Object.keys(allFiles);
  const [selectedFile, setSelectedFile] = useState(fileKeys[0] || '');

  const active = allFiles[selectedFile] || { original: '', modernized: '' };

  return (
    <div className="page-view active-view">
      <div className="card-panel">
        <div className="diff-header-bar">
          <h3 className="card-panel-title">Comparative Code Diff Viewer</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Comparing File:</span>
            <select
              className="form-input"
              style={{ width: '220px' }}
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
            >
              {fileKeys.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="diff-grid">
          {/* Original Panel */}
          <div className="diff-panel original-panel">
            <div className="diff-panel-title">
              <span>Original Source (Legacy ASP / PHP)</span>
              <span className="diff-tag-deleted">REMOVED</span>
            </div>
            <pre className="diff-code-area" style={{ margin: 0, padding: '16px', overflowX: 'auto', fontSize: '12px' }}>
              <code>{active.original}</code>
            </pre>
          </div>

          {/* Modernized Panel */}
          <div className="diff-panel upgraded-panel">
            <div className="diff-panel-title">
              <span>Modernized Architecture (React.js + Flask / MongoDB)</span>
              <span className="diff-tag-added">MODERNIZED</span>
            </div>
            <pre className="diff-code-area" style={{ margin: 0, padding: '16px', overflowX: 'auto', fontSize: '12px' }}>
              <code>{active.modernized}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
