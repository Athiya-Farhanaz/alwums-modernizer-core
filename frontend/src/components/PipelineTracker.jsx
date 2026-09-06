import React, { useEffect, useRef } from 'react';

export default function PipelineTracker({
  logs = [],
  currentStage = 3,
  projectName = 'Inventory_System',
  targetTech = 'Python (Flask)',
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
    { num: 1, name: 'Analyzer', desc: 'Code Analysis', defaultTime: '00:01:45' },
    { num: 2, name: 'Planner', desc: 'Strategy Planning', defaultTime: '00:01:12' },
    { num: 3, name: 'Generator', desc: 'Code Generation', defaultTime: '00:02:34' },
    { num: 4, name: 'Tester', desc: 'Quality Testing', defaultTime: '--:--:--' },
    { num: 5, name: 'Verifier', desc: 'Verification & Review', defaultTime: '--:--:--' },
    { num: 6, name: 'Finalizer', desc: 'Packaging & Delivery', defaultTime: '--:--:--' }
  ];

  const currentAgent = agents[Math.min(currentStage - 1, 5)];
  const progressPercent = Math.min(Math.round((currentStage / 6) * 100), 100);

  return (
    <div className="page-view active-view">
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
            background: currentStage >= 6 ? '#ecfdf5' : '#eff6ff',
            color: currentStage >= 6 ? '#059669' : '#2563eb'
          }}>
            {currentStage >= 6 ? 'Completed' : 'In Progress'}
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
                    <span style={{ color: '#38bdf8' }}>{log.agent || 'Generator'}:</span>{' '}
                    <span style={{ color: log.level === 'error' ? '#f87171' : log.level === 'success' ? '#4ade80' : '#e2e8f0' }}>
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div><span style={{ color: '#64748b' }}>[10:30:45]</span> <span style={{ color: '#38bdf8' }}>Generator:</span> Generator started</div>
                  <div><span style={{ color: '#64748b' }}>[10:30:46]</span> <span style={{ color: '#38bdf8' }}>Generator:</span> Reading task decomposition plan... Done</div>
                  <div><span style={{ color: '#64748b' }}>[10:30:48]</span> <span style={{ color: '#38bdf8' }}>Generator:</span> Generating routes.py ...</div>
                  <div><span style={{ color: '#64748b' }}>[10:30:58]</span> <span style={{ color: '#38bdf8' }}>Generator:</span> Generating models.py ...</div>
                  <div><span style={{ color: '#64748b' }}>[10:31:10]</span> <span style={{ color: '#38bdf8' }}>Generator:</span> Generating templates/products.html ...</div>
                  <div><span style={{ color: '#64748b' }}>[10:31:15]</span> <span style={{ color: '#4ade80' }}>Generator:</span> Code generation progress: 60%</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
