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
                      <div style={{ width: `${tech.percent}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complexity Score Bar */}
            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Complexity Score:
                </span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginLeft: '8px' }}>
                  7.4 / 10
                </span>
              </div>
              <span style={{
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '12px'
              }}>
                High
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
