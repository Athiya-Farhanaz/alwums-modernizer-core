import React, { useState } from 'react';

export default function AnalyzerReport({ projectName = 'Inventory_System', onNavigate }) {
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Structure', 'Dependencies', 'Anti-Patterns', 'Summary'];

  const stats = [
    { label: 'Total Files', value: 142 },
    { label: 'ASP Files', value: 87 },
    { label: 'Includes', value: 23 },
    { label: 'DB Connections', value: 12 }
  ];

  const techStack = [
    { name: 'Classic ASP', count: 87, percent: 61 },
    { name: 'HTML', count: 24, percent: 17 },
    { name: 'JavaScript', count: 15, percent: 11 },
    { name: 'CSS', count: 10, percent: 7 },
    { name: 'Others', count: 6, percent: 4 }
  ];

  return (
    <div className="page-view active-view">
      <div className="card-panel" style={{ padding: '24px' }}>
        {/* Header Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Project: {projectName} &gt;
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
              Analyzer Report
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={() => onNavigate('pipeline')}>
              View Pipeline
            </button>
            <button className="btn-primary" onClick={() => onNavigate('diff')}>
              Compare Code Diff →
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab ? '#3b82f6' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'Overview' && (
          <div>
            {/* 4 Metric Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {stats.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '16px 20px'
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* 2-Column Split: Legacy Summary (Left) & Technology Stack + Complexity (Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Left Column: Legacy Summary */}
              <div style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '20px'
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
                  Legacy Summary
                </h4>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <li>Classic ASP version 3.0 syntax detected with VBScript scripting runtime.</li>
                  <li><code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Global.asa</code> used for session and application state management.</li>
                  <li>Unparameterized SQL queries found in <strong>45 files</strong> with severe SQL injection risks.</li>
                  <li><code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Response.Write</code> used extensively for HTML string concatenation.</li>
                  <li>Ad-hoc error handling with <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>On Error Resume Next</code> suppressing runtime exceptions.</li>
                  <li>Heavy coupling between presentation markup and business logic.</li>
                </ul>
              </div>

              {/* Right Column: Technology Stack (Detected) & Complexity Score */}
              <div style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
                    Technology Stack (Detected)
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {techStack.map((tech, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tech.name}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{tech.count} ({tech.percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${tech.percent}%`,
                            height: '100%',
                            background: '#3b82f6',
                            borderRadius: '3px'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Complexity Score</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>7.4 / 10</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: '10px' }}>High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Structure */}
        {activeTab === 'Structure' && (
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              Legacy Codebase Architecture Tree
            </h4>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.8, color: 'var(--text-primary)' }}>
              <div>📁 <strong>{projectName}/</strong></div>
              <div style={{ paddingLeft: '20px' }}>├── 📁 <strong>includes/</strong> <span style={{ color: 'var(--text-muted)' }}>(23 header/utility files)</span></div>
              <div style={{ paddingLeft: '40px' }}>├── conn.asp <span style={{ color: '#ef4444' }}>[ADODB database connection pool]</span></div>
              <div style={{ paddingLeft: '40px' }}>└── auth_check.asp <span style={{ color: '#f59e0b' }}>[Session validation]</span></div>
              <div style={{ paddingLeft: '20px' }}>├── 📁 <strong>scripts/</strong> <span style={{ color: 'var(--text-muted)' }}>(15 client-side JavaScript files)</span></div>
              <div style={{ paddingLeft: '20px' }}>├── 📁 <strong>styles/</strong> <span style={{ color: 'var(--text-muted)' }}>(10 legacy CSS stylesheets)</span></div>
              <div style={{ paddingLeft: '20px' }}>├── Global.asa <span style={{ color: '#8b5cf6' }}>[Application initialization & global state]</span></div>
              <div style={{ paddingLeft: '20px' }}>├── default.asp <span style={{ color: '#3b82f6' }}>[Portal landing route & authentication]</span></div>
              <div style={{ paddingLeft: '20px' }}>├── products.asp <span style={{ color: '#3b82f6' }}>[Inventory catalog with inline SQL]</span></div>
              <div style={{ paddingLeft: '20px' }}>└── checkout.asp <span style={{ color: '#3b82f6' }}>[Transaction processing engine]</span></div>
            </div>
          </div>
        )}

        {/* Tab 3: Dependencies */}
        {activeTab === 'Dependencies' && (
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              Detected Legacy Runtime Dependencies
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '14px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>ADODB.Connection</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Legacy COM database driver → Migrating to modern ORM / async connection pool.</p>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>MSWC.AdRotator</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Legacy IIS component → Modernized to static React Carousel components.</p>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Scripting.FileSystemObject</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Direct server disk I/O → Converted to secure sandboxed storage layer.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Anti-Patterns */}
        {activeTab === 'Anti-Patterns' && (
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              Discovered Anti-Patterns & Security Risks
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: 'SQL Injection Vulnerability', desc: 'String concatenation used for dynamic SQL queries without parameterized inputs in 45 files.', severity: 'Critical' },
                { title: 'Silent Error Suppression', desc: '"On Error Resume Next" hides syntax errors and database connection failures.', severity: 'High' },
                { title: 'Tightly Coupled Markup & Logic', desc: 'Business rules mixed directly into HTML render loops without MVC separation.', severity: 'Medium' },
                { title: 'Unencrypted Session Cookies', desc: 'Session IDs stored in plain text without HttpOnly and Secure cookie flags.', severity: 'High' }
              ].map((ap, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{ap.title}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{ap.desc}</div>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: ap.severity === 'Critical' ? '#fef2f2' : ap.severity === 'High' ? '#fffbeb' : '#eff6ff',
                    color: ap.severity === 'Critical' ? '#dc2626' : ap.severity === 'High' ? '#d97706' : '#2563eb'
                  }}>
                    {ap.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Summary */}
        {activeTab === 'Summary' && (
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              Modernization Readiness Assessment
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              The codebase is a high-priority candidate for autonomous multi-agent modernization. The 6-agent pipeline will decouple monolithic Classic ASP pages into modern API endpoints and componentized single-page views, resolving 100% of discovered SQL vulnerabilities and legacy COM dependencies.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-primary" onClick={() => onNavigate('pipeline')}>
                Execute Upgrade Pipeline
              </button>
              <button className="btn-outline" onClick={() => onNavigate('upload')}>
                Reconfigure Target Architecture
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
