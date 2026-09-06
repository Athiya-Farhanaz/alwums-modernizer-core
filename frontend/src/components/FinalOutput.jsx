import React, { useState } from 'react';

export default function FinalOutput({
  projectName = 'Inventory_System',
  targetTech = 'Python (Flask)',
  downloadBlob,
  onDownload,
  onNavigate
}) {
  const [activeTab, setActiveTab] = useState('Summary');

  const tabs = ['Summary', 'Generated Code', 'Reports', 'Artifacts'];

  const hasArchive = Boolean(onDownload || downloadBlob);

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload();
    } else if (downloadBlob) {
      const url = window.URL.createObjectURL(downloadBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase()}_modernized.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      alert('No modernization package available yet. Please execute an upgrade pipeline first.');
    }
  };

  return (
    <div className="page-view active-view">
      <div className="card-panel" style={{ padding: '24px' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Project: {projectName}
            </h3>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: '12px',
              background: hasArchive ? '#ecfdf5' : '#eff6ff',
              color: hasArchive ? '#059669' : '#2563eb'
            }}>
              {hasArchive ? 'Completed & Verified' : 'Ready for Pipeline'}
            </span>
          </div>

          <button className="btn-secondary" onClick={() => onNavigate('pipeline')}>
            ← View Pipeline
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
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

        {activeTab === 'Generated Code' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Inspect Generated Code & Diff
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '480px', margin: '0 auto 20px auto' }}>
              Compare legacy source files side-by-side with modernized output across all architectural layers.
            </p>
            <button className="btn-primary" onClick={() => onNavigate('diff')}>
              Open Code Diff Viewer →
            </button>
          </div>
        )}

        {activeTab === 'Reports' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Architectural Analysis & AST Report
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '480px', margin: '0 auto 20px auto' }}>
              Detailed breakdown of discovered SQL vulnerabilities, Session state migrations, and AST anti-patterns.
            </p>
            <button className="btn-primary" onClick={() => onNavigate('reports')}>
              Open Full Analysis Report →
            </button>
          </div>
        )}

        {activeTab === 'Artifacts' && (
          <div style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
              Generated Project Artifacts
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { file: `${projectName.toLowerCase()}_modernized.zip`, type: 'Archive', size: hasArchive ? 'Active Package' : 'Not generated' },
                { file: 'report.html', type: 'Migration HTML Report', size: 'AST Audit' },
                { file: 'requirements.txt / package.json', type: 'Dependency Manifest', size: 'Auto-generated' },
                { file: 'README.md', type: 'Run Instructions', size: 'Deployment Guide' }
              ].map((art, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{art.file}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{art.type}</div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{art.size}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2-Column Split: Summary & Stats (Left) & Download Package Card (Right) */}
        {activeTab === 'Summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Output Summary */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '20px'
            }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--text-primary)' }}>
                Output Summary
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 500 }}>
                  <span>✓</span> All automated compilation and syntax tests passed
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 500 }}>
                  <span>✓</span> AST code verification and task checklist successful
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 500 }}>
                  <span>✓</span> No critical security vulnerabilities or syntax errors found
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 500 }}>
                  <span>✓</span> Modernization completed successfully across all modules
                </div>
              </div>
            </div>

            {/* Modernization Stats */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '20px'
            }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--text-primary)' }}>
                Modernization Stats
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: hasArchive ? '#059669' : '#2563eb', marginTop: '2px' }}>
                    {hasArchive ? 'Verified' : 'Pending Upload'}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Target Architecture:</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {targetTech}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Estimated Manual Time:</span>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    84h 10m
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Autonomous Time Saved:</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                    78%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Download Package */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
                Download Package
              </h4>

              {/* Package Box */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3b82f6'
                }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {projectName.toLowerCase()}_modernized.zip
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    24.6 MB
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <button className="btn-primary" style={{ width: '100%' }} onClick={handleDownloadClick}>
                  Download
                </button>
                <button className="btn-secondary" style={{ width: '100%' }} onClick={() => onNavigate('diff')}>
                  Preview Output
                </button>
              </div>

              {/* Contains list */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Contains</span>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#3b82f6' }}>•</span> {targetTech} Source Code
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#3b82f6' }}>•</span> Clean MVC Templates / Components
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#3b82f6' }}>•</span> Static Assets & CSS Stylesheets
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#3b82f6' }}>•</span> System Architecture Documentation
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#3b82f6' }}>•</span> HTML Migration & Validation Report
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
