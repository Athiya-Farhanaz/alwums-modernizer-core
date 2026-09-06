import React, { useState, useEffect } from 'react';

export const SAMPLE_FILES = {
  // --- Screen 6 Reference Match: products.asp -> products.py ---
  'products.py': {
    targetLanguage: 'Python (Flask)',
    category: 'python',
    originalTitle: 'Original (Classic ASP)',
    modernizedTitle: 'Generated (Python Flask)',
    original: `<%
conn = Server.CreateObject("ADODB.Connection")
conn.Open Application("connStr")
sql = "SELECT * FROM Products"
Set rs = conn.Execute(sql)
do while not rs.EOF
  Response.Write "<tr>"
  Response.Write "<td>" & rs("Name") & "</td>"
  rs.MoveNext
loop
%>`,
    modernized: `from flask import render_template
from db import get_connection

@app.route('/products')
def products():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM Products")
    products = cur.fetchall()
    return render_template('products.html', products=products)`
  },

  // --- C# ASP.NET Core ---
  'Login.cshtml': {
    targetLanguage: 'C# (ASP.NET Core Razor Pages)',
    category: 'csharp',
    originalTitle: 'Original Legacy Source (Classic ASP / VBScript - login.asp)',
    modernizedTitle: 'Modernized Code (C# ASP.NET Core 8 Razor Pages)',
    original: `<%@ Language="VBScript" %>
<html>
<head><title>User Login</title></head>
<body>
<%
  ' Direct string concatenation - high risk SQL injection
  Dim conn, rs, sql, user, pwd
  user = Request.Form("username")
  pwd = Request.Form("password")
  
  Set conn = Server.CreateObject("ADODB.Connection")
  conn.Open "DSN=LegacyDB;Uid=sa;Pwd=secret;"
  sql = "SELECT * FROM Users WHERE Username = '" & user & "' AND Pwd = '" & pwd & "'"
  Set rs = conn.Execute(sql)
  
  If Not rs.EOF Then
    Session("Authenticated") = True
    Response.Redirect "dashboard.asp"
  Else
    Response.Write("<p style='color:red;'>Invalid login!</p>")
  End If
%>
  <form method="POST" action="login.asp">
    <input type="text" name="username" />
    <input type="password" name="password" />
    <input type="submit" value="Sign In" />
  </form>
</body>
</html>`,
    modernized: `@page
@model AlwumsModernizer.Pages.LoginModel
@{
    ViewData["Title"] = "Modern Secure Sign In";
}

<!-- Modern C# ASP.NET Core 8 Razor Page with Antiforgery & Model Binding -->
<div class="card auth-container shadow-sm">
    <h2 class="auth-title">Sign In</h2>

    @if (!ModelState.IsValid)
    {
        <div class="alert alert-danger" role="alert">
            <span asp-validation-summary="All"></span>
        </div>
    }

    <form method="post">
        @Html.AntiForgeryToken()
        <div class="form-group mb-3">
            <label asp-for="Input.Username" class="form-label"></label>
            <input asp-for="Input.Username" class="form-control" autocomplete="username" required />
            <span asp-validation-for="Input.Username" class="text-danger"></span>
        </div>

        <div class="form-group mb-3">
            <label asp-for="Input.Password" class="form-label"></label>
            <input asp-for="Input.Password" type="password" class="form-control" autocomplete="current-password" required />
            <span asp-validation-for="Input.Password" class="text-danger"></span>
        </div>

        <button type="submit" class="btn btn-primary w-100">Sign In to Dashboard</button>
    </form>
</div>`
  },

  'AuthController.cs': {
    targetLanguage: 'C# (ASP.NET Core Web API)',
    category: 'csharp',
    originalTitle: 'Original Legacy Source (Classic ASP - auth_service.asp)',
    modernizedTitle: 'Modernized Code (C# ASP.NET Core 8 Web API)',
    original: `<%
  ' Legacy Classic ASP ADODB Web Handler
  Dim action, user, pass
  action = Request.QueryString("action")
  user = Request.Form("user")
  pass = Request.Form("pass")

  If action = "login" Then
    Set conn = Server.CreateObject("ADODB.Connection")
    conn.Open "Provider=SQLOLEDB;Data Source=db;Initial Catalog=app;User Id=sa;Password=pwd;"
    Set cmd = Server.CreateObject("ADODB.Command")
    cmd.ActiveConnection = conn
    cmd.CommandText = "SELECT * FROM Accounts WHERE AccUser = '" & user & "'"
    Set rs = cmd.Execute
    Response.ContentType = "text/plain"
    Response.Write "{""success"": true}"
  End If
%>`,
    modernized: `using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace AlwumsModernizer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher _hasher;

        public AuthController(AppDbContext context, IPasswordHasher hasher)
        {
            _context = context;
            _hasher = hasher;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Parameterized Entity Framework Core query prevents SQL injection
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null || !_hasher.Verify(request.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid username or credentials" });

            return Ok(new { status = "success", userId = user.Id, username = user.Username });
        }
    }
}`
  },

  // --- Python (Flask) ---
  'auth_routes.py': {
    targetLanguage: 'Python (Flask REST API & MongoDB)',
    category: 'python',
    originalTitle: 'Original Legacy Source (Legacy PHP 5.x - auth.php)',
    modernizedTitle: 'Modernized Code (Python Flask REST API + MongoDB)',
    original: `<?php
// Legacy PHP 5.2 query with direct string interpolation
$user = $_POST['username'];
$pass = $_POST['password'];

$link = mysql_connect('localhost', 'root', 'root');
mysql_select_db('legacy_users', $link);

// Severe SQL Injection vulnerability
$sql = "SELECT * FROM members WHERE user = '$user' AND pass = '$pass'";
$res = mysql_query($sql, $link);
$row = mysql_fetch_assoc($res);

if ($row) {
    session_start();
    $_SESSION['uid'] = $row['id'];
    echo json_encode(array("status" => "success"));
} else {
    echo json_encode(array("status" => "error"));
}
?>`,
    modernized: `# Modernized Python Flask REST Controller with MongoDB NoSQL
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

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    # Secure NoSQL MongoDB query preventing SQL injection
    user_doc = db.users.find_one({"username": username})
    if not user_doc or not bcrypt.checkpw(password.encode('utf-8'), user_doc['password_hash']):
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({
        "status": "success",
        "user": username,
        "role": user_doc.get("role", "member")
    }), 200`
  },

  // --- Python (FastAPI) ---
  'routes_fastapi.py': {
    targetLanguage: 'Python (FastAPI Async & PostgreSQL)',
    category: 'python',
    originalTitle: 'Original Legacy Source (Classic ASP - auth_service.asp)',
    modernizedTitle: 'Modernized Code (Python FastAPI Async + SQLAlchemy)',
    original: `<%
Dim username, pwd, conn, rs
username = Request("user")
pwd = Request("pwd")
Set conn = Server.CreateObject("ADODB.Connection")
conn.Open "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=db.mdb;"
Set rs = conn.Execute("SELECT * FROM Users WHERE u = '" & username & "'")
Response.Write("{ ""user"": """ & rs("u") & """ }")
%>`,
    modernized: `from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import passlib.hash

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginSchema(BaseModel):
    username: str
    password: str

@router.post("/login", status_code=status.HTTP_200_OK)
async def login(credentials: LoginSchema, db: AsyncSession = Depends(get_db)):
    # Async non-blocking query using SQLAlchemy 2.0 ORM
    query = select(UserModel).where(UserModel.username == credentials.username)
    result = await db.execute(query)
    user = result.scalars().first()

    if not user or not passlib.hash.bcrypt.verify(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect username or password"
        )

    return {"status": "authenticated", "username": user.username}`
  },

  // --- React.js Frontend ---
  'LoginComponent.jsx': {
    targetLanguage: 'React.js (JSX & Hooks)',
    category: 'react',
    originalTitle: 'Original Legacy Source (Classic ASP UI - login.asp)',
    modernizedTitle: 'Modernized Code (React.js 18 Component & Hooks)',
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Secure REST API call to backend API
      const res = await axios.post('/api/auth/login', { username, password });
      localStorage.setItem('auth_token', res.data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <h2>Sign In</h2>
      {error && <div className="error-alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            id="username"
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}`
  },

  // --- Node.js / Express ---
  'authController.ts': {
    targetLanguage: 'JavaScript / TypeScript (Node.js & Express)',
    category: 'nodejs',
    originalTitle: 'Original Legacy Source (Legacy PHP 5.x - auth.php)',
    modernizedTitle: 'Modernized Code (Node.js Express & TypeScript REST API)',
    original: `<?php
// Legacy procedural PHP script
$u = $_GET['user'];
$p = $_GET['pass'];
$c = mysqli_connect('localhost', 'user', 'pass', 'db');
$q = "SELECT id, hash FROM accounts WHERE username='$u'";
$r = mysqli_query($c, $q);
$row = mysqli_fetch_assoc($r);
echo json_encode($row);
?>`,
    modernized: `import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Parameterized Prisma ORM query prevents SQL injection
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { sub: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secretKey',
      { expiresIn: '8h' }
    );

    return res.status(200).json({ token, username: user.username });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});`
  },

  // --- Java Spring Boot ---
  'AuthController.java': {
    targetLanguage: 'Java (Spring Boot 3 Enterprise)',
    category: 'java',
    originalTitle: 'Original Legacy Source (Classic ASP / VBScript - login.asp)',
    modernizedTitle: 'Modernized Code (Java Spring Boot 3 Controller)',
    original: `<%
  Dim user, pass, conn, rs
  user = Request("username")
  pass = Request("password")
  Set conn = Server.CreateObject("ADODB.Connection")
  conn.Open "DSN=LegacyDB;"
  Set rs = conn.Execute("SELECT * FROM USERS WHERE USER_NAME = '" & user & "'")
  If Not rs.EOF Then
    Response.Write("SUCCESS")
  End If
%>`,
    modernized: `package com.alwums.modernizer.controller;

import com.alwums.modernizer.dto.LoginRequest;
import com.alwums.modernizer.dto.AuthResponse;
import com.alwums.modernizer.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return userService.findByUsername(request.getUsername())
            .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPasswordHash()))
            .map(u -> ResponseEntity.ok(new AuthResponse("success", u.getUsername())))
            .orElseGet(() -> ResponseEntity.status(401).build());
    }
}`
  },

  // --- PHP 8.3 Laravel ---
  'AuthController.php': {
    targetLanguage: 'PHP 8.3 (Modern Laravel MVC)',
    category: 'php',
    originalTitle: 'Original Legacy Source (Legacy PHP 5.2 - login.php)',
    modernizedTitle: 'Modernized Code (PHP 8.3 Laravel MVC Controller)',
    original: `<?php
// Legacy procedural PHP with deprecated mysql_* extension
$u = $_POST['user'];
$p = $_POST['pass'];
$conn = mysql_connect("localhost", "root", "");
mysql_select_db("app_db");
$res = mysql_query("SELECT * FROM users WHERE uname='$u'");
$row = mysql_fetch_array($res);
if ($row['pass'] == md5($p)) {
    echo "Welcome " . $row['uname'];
}
?>`,
    modernized: `<?php

declare(strict_types=1);

namespace App\\Http\\Controllers\\Auth;

use App\\Http\\Controllers\\Controller;
use App\\Models\\User;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Hash;

class AuthController extends Controller
{
    /**
     * Authenticate user with Eloquent ORM & bcrypt password verification.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::where('username', $validated['username'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'The provided credentials do not match our records.'
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'username' => $user->username
            ]
        ]);
    }
}`
  },

  // --- Go (Golang Gin) ---
  'auth_handler.go': {
    targetLanguage: 'Go (Golang Gin Microservice)',
    category: 'golang',
    originalTitle: 'Original Legacy Source (Classic ASP - login.asp)',
    modernizedTitle: 'Modernized Code (Go Golang Gin Microservice)',
    original: `<%
' Legacy Classic ASP Login handler
Dim u, p, conn, rs
u = Request.Form("u")
p = Request.Form("p")
Set conn = Server.CreateObject("ADODB.Connection")
conn.Open "Provider=SQLOLEDB;Data Source=db;Initial Catalog=app;User Id=sa;Password=pwd;"
Set rs = conn.Execute("SELECT * FROM users WHERE u = '" & u & "'")
Response.Write rs("id")
%>`,
    modernized: `package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type LoginInput struct {
	Username string \`json:"username" binding:"required"\`
	Password string \`json:"password" binding:"required"\`
}

// LoginHandler handles user authentication with high-performance concurrent Go
func LoginHandler(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	user, err := FindUserByUsername(input.Username)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid username or password"})
		return
	}

	token, _ := GenerateJWT(user.ID, user.Username)
	c.JSON(http.StatusOK, gin.H{
		"status":   "success",
		"token":    token,
		"username": user.Username,
	})
}`
  }
};

const LANGUAGE_CATEGORIES = [
  { id: 'all', label: 'All Target Languages' },
  { id: 'csharp', label: 'C# (ASP.NET Core 8 / Razor)' },
  { id: 'python', label: 'Python (Flask & FastAPI)' },
  { id: 'react', label: 'React.js Frontend' },
  { id: 'nodejs', label: 'TypeScript / Node.js Express' },
  { id: 'java', label: 'Java (Spring Boot 3)' },
  { id: 'php', label: 'PHP 8.3 (Modern Laravel)' },
  { id: 'golang', label: 'Go (Golang Gin)' }
];

export default function DiffViewer({ customFiles, targetTech, projectName = 'Modernization Project' }) {
  const hasCustom = customFiles && Object.keys(customFiles).length > 0;
  const allFiles = { ...(hasCustom ? customFiles : {}), ...SAMPLE_FILES };
  const allKeys = Object.keys(allFiles);

  const categories = [
    { id: 'all', label: 'All Target Languages' },
    ...(hasCustom ? [{ id: 'custom', label: `✨ Upgraded Files (${Object.keys(customFiles).length})` }] : []),
    { id: 'csharp', label: 'C# (ASP.NET Core 8 / Razor)' },
    { id: 'python', label: 'Python (Flask & FastAPI)' },
    { id: 'react', label: 'React.js Frontend' },
    { id: 'nodejs', label: 'TypeScript / Node.js Express' },
    { id: 'java', label: 'Java (Spring Boot 3)' },
    { id: 'php', label: 'PHP 8.3 (Modern Laravel)' },
    { id: 'golang', label: 'Go (Golang Gin)' }
  ];

  // Derive initial category: prioritize custom upgraded files if they exist
  const determineInitialCategory = () => {
    if (hasCustom) return 'custom';
    if (!targetTech) return 'all';
    const lower = targetTech.toLowerCase();
    if (lower.includes('c#') || lower.includes('dotnet') || lower.includes('razor')) return 'csharp';
    if (lower.includes('flask') || lower.includes('fastapi') || lower.includes('python')) return 'python';
    if (lower.includes('react')) return 'react';
    if (lower.includes('node') || lower.includes('express') || lower.includes('typescript')) return 'nodejs';
    if (lower.includes('java') || lower.includes('spring')) return 'java';
    if (lower.includes('laravel') || lower.includes('php')) return 'php';
    if (lower.includes('go') || lower.includes('gin')) return 'golang';
    return 'all';
  };

  const [selectedCategory, setSelectedCategory] = useState(determineInitialCategory());
  
  // Filter available files based on chosen category
  const filteredKeys = allKeys.filter(k => {
    if (selectedCategory === 'all') return true;
    return allFiles[k]?.category === selectedCategory;
  });

  const [selectedFile, setSelectedFile] = useState(filteredKeys[0] || allKeys[0] || '');

  // When customFiles arrive, switch to custom category
  useEffect(() => {
    if (hasCustom) {
      setSelectedCategory('custom');
      const customKeys = Object.keys(customFiles);
      if (customKeys.length > 0) {
        setSelectedFile(customKeys[0]);
      }
    }
  }, [customFiles]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    const matches = allKeys.filter(k => cat === 'all' || allFiles[k]?.category === cat);
    if (matches.length > 0) {
      setSelectedFile(matches[0]);
    }
  };

  const active = allFiles[selectedFile] || {
    original: '',
    modernized: '',
    targetLanguage: 'Target Language',
    originalTitle: 'Original Source (Legacy ASP / PHP)',
    modernizedTitle: 'Modernized Code'
  };

  const rightPanelTitle = active.modernizedTitle || `Modernized Code (${active.targetLanguage || 'Modernized Architecture'})`;
  const leftPanelTitle = active.originalTitle || 'Original Source (Legacy ASP / PHP)';

  const renderCodeWithLineNumbers = (code) => {
    if (!code) return <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px' }}>No code content</div>;
    const lines = code.split('\n');
    return (
      <div style={{ display: 'table', width: '100%' }}>
        {lines.map((line, idx) => (
          <div key={idx} style={{ display: 'table-row', minHeight: '20px' }}>
            <span style={{
              display: 'table-cell',
              width: '38px',
              textAlign: 'right',
              paddingRight: '12px',
              userSelect: 'none',
              color: 'var(--text-muted)',
              opacity: 0.6,
              fontSize: '11px',
              borderRight: '1px solid var(--border-color)',
              verticalAlign: 'top'
            }}>
              {idx + 1}
            </span>
            <span style={{
              display: 'table-cell',
              paddingLeft: '12px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              {line || ' '}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-view active-view">
      <div className="card-panel">
        <div className="diff-header-bar" style={{ flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Project: {projectName} &gt;</div>
            <h3 className="card-panel-title" style={{ margin: '2px 0 0 0' }}>Code Diff</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Target Modernization Language Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Target:</span>
              <select
                className="form-input filter-dropdown"
                style={{ width: '240px' }}
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Target File Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>File:</span>
              <select
                className="form-input filter-dropdown"
                style={{ width: '220px' }}
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
              >
                {filteredKeys.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="diff-container" style={{ height: '540px' }}>
          {/* Original Source Panel */}
          <div className="diff-panel original-panel">
            <div className="diff-panel-title">
              <span title={leftPanelTitle}>{leftPanelTitle}</span>
              <span style={{ color: 'var(--color-danger)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>LEGACY SOURCE</span>
            </div>
            <div style={{
              flex: 1,
              padding: '12px 8px',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: 1.6
            }}>
              {renderCodeWithLineNumbers(active.original)}
            </div>
          </div>

          {/* Modernized Architecture Panel */}
          <div className="diff-panel upgraded-panel">
            <div className="diff-panel-title">
              <span title={rightPanelTitle} style={{ color: 'var(--color-success)', fontWeight: 600 }}>{rightPanelTitle}</span>
              <span style={{ color: 'var(--color-success)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>MODERNIZED</span>
            </div>
            <div style={{
              flex: 1,
              padding: '12px 8px',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: 1.6
            }}>
              {renderCodeWithLineNumbers(active.modernized)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
