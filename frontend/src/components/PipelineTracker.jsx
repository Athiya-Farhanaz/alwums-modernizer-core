import React, { useEffect, useRef } from 'react';

export default function PipelineTracker({
  logs = [],
  currentStage = 0,
  projectName = 'Inventory_System',
  targetTech = 'Python (Flask)',
  error = null,
  onDownload,
  onNavigate
}) {
  const consoleRef = useRef(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const agents = [
    { num: 1, name: 'Discovery Agent', desc: 'Code Discovery & Scanning', defaultTime: '00:00:15' },
    { num: 2, name: 'Manager Agent', desc: 'Task Planning & Checklist', defaultTime: '00:00:12' },
    { num: 3, name: 'Prompt Maker Agent', desc: 'Context-Aware Prompt Synthesis', defaultTime: '00:00:18' },
    { num: 4, name: 'Execution Agent', desc: 'Autonomous Code Generation', defaultTime: '00:00:45' },
    { num: 5, name: 'Validator Agent', desc: 'Verification & Feedback Loop', defaultTime: '00:00:20' },
    { num: 6, name: 'Finalizer Agent', desc: 'Compiler Testing & Packaging', defaultTime: '00:00:25' }
  ];

  const currentAgent = agents[Math.min(Math.max(currentStage - 1, 0), 5)];
  const progressPercent = Math.min(Math.round((currentStage / 6) * 100), 100);
  const statusLabel = error ? 'Failed' : currentStage >= 6 ? 'Completed' : currentStage > 0 ? 'In Progress' : 'Ready';
  const statusColor = error ? { bg: '#fef2f2', text: '#dc2626' } : currentStage >= 6 ? { bg: '#ecfdf5', text: '#059669' } : { bg: '#eff6ff', text: '#2563eb' };

  return (
    <div className="page-view active-view">
      {/* Error Banner */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong style={{ color: '#dc2626', fontSize: '13px' }}>Pipeline Interrupted: </strong>
            <span style={{ color: '#7f1d1d', fontSize: '13px' }}>{error}</span>
          </div>
          <button className="btn-secondary" onClick={() => onNavigate('upload')} style={{ fontSize: '12px', padding: '6px 12px' }}>
            Try Again
          </button>
        </div>
      )}

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
            background: statusColor.bg,
            color: statusColor.text
          }}>
            {statusLabel}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {currentStage >= 6 && onNavigate && (
            <button className="btn-secondary" onClick={() => onNavigate('diff')}>
              Inspect in Code Diff →
            </button>
          )}
          {currentStage >= 6 && onDownload && (
            <button className="btn-primary" onClick={onDownload}>
              Download Package
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Split: Agent Pipeline (Left) & Execution Details + Terminal (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '20px' }}>
        {/* Left Column: Agent Pipeline */}
        <div className="card-panel" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
            Agent Pipeline
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {agents.map((ag) => {
              const isCompleted = currentStage > ag.num;
              const isInProgress = currentStage === ag.num;

              return (
                <div
                  key={ag.num}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: isInProgress ? '1.5px solid #3b82f6' : '1px solid var(--border-color)',
                    background: isInProgress ? 'rgba(59, 130, 246, 0.04)' : 'var(--bg-secondary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isCompleted ? '#ecfdf5' : isInProgress ? '#3b82f6' : 'var(--bg-primary)',
                      color: isCompleted ? '#059669' : isInProgress ? '#ffffff' : 'var(--text-muted)',
                      border: isCompleted ? '1px solid #10b981' : 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isCompleted ? '✓' : ag.num}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {ag.num} &nbsp; {ag.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {ag.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: isCompleted ? '#ecfdf5' : isInProgress ? '#eff6ff' : 'var(--bg-primary)',
                      color: isCompleted ? '#059669' : isInProgress ? '#2563eb' : 'var(--text-muted)'
                    }}>
                      {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                    </span>

                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Time: {isCompleted ? ag.defaultTime : isInProgress ? '00:02:34' : '--:--:--'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Execution Details & Live Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Execution Details Card */}
          <div className="card-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              Execution Details
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Current Agent:</span>
                <span style={{ fontWeight: 700, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
                  {currentAgent?.name || 'Generator'}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Status: </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {currentStage >= 6 ? 'Modernization verified and compiled.' : `Generating ${targetTech} code...`}
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{progressPercent}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: '#3b82f6',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', fontSize: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Started At: </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>12 May 2025 10:30:45 AM</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Elapsed Time: </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>00:02:34</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Logs Card */}
          <div className="card-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Live Logs
              </h4>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>● Active Stream</span>
            </div>

            <div
              ref={consoleRef}
              style={{
                flex: 1,
                minHeight: '220px',
                background: '#0b1120',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: 1.6,
                color: '#94a3b8',
                overflowY: 'auto'
              }}
            >
              {logs.length > 0 ? (
                logs.map((log, i) => (
                  <div key={i} style={{ marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>[{log.time || '10:30:45'}]</span>{' '}
                    <span style={{ color: '#38bdf8' }}>{log.agent || 'Execution Agent'}:</span>{' '}
                    <span style={{ color: log.level === 'error' ? '#f87171' : log.level === 'success' ? '#4ade80' : '#e2e8f0' }}>
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div><span style={{ color: '#64748b' }}>[10:30:12]</span> <span style={{ color: '#38bdf8' }}>Discovery Agent:</span> Codebase scanning complete. 142 files correlated.</div>
                  <div><span style={{ color: '#64748b' }}>[10:30:46]</span> <span style={{ color: '#38bdf8' }}>Manager Agent:</span> Task checklist and dependency graph built.</div>
                  <div><span style={{ color: '#64748b' }}>[10:30:58]</span> <span style={{ color: '#38bdf8' }}>Prompt Maker Agent:</span> Context-aware prompts synthesized.</div>
                  <div><span style={{ color: '#64748b' }}>[10:31:05]</span> <span style={{ color: '#38bdf8' }}>Execution Agent:</span> Generating modernized routes.py ...</div>
                  <div><span style={{ color: '#64748b' }}>[10:31:12]</span> <span style={{ color: '#38bdf8' }}>Validator Agent:</span> Verifying against AST checklist... Passed.</div>
                  <div><span style={{ color: '#64748b' }}>[10:31:15]</span> <span style={{ color: '#4ade80' }}>Finalizer Agent:</span> Virtual runtime test verified (Pass).</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
