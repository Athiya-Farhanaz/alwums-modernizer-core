import React, { useEffect, useRef } from 'react';

export default function PipelineTracker({ logs, currentStage, onDownload }) {
  const consoleRef = useRef(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const stages = [
    { num: 1, name: 'Discovery Agent', desc: 'Identifies legacy technologies, dependencies, and structure' },
    { num: 2, name: 'Manager Agent', desc: 'Builds modernization checklist and task dependency order' },
    { num: 3, name: 'Prompt Maker Agent', desc: 'Synthesizes context-aware prompts for code execution' },
    { num: 4, name: 'Execution Agent', desc: 'Modernizes code via Gemini LLM into React.js & Flask' },
    { num: 5, name: 'Validator Agent', desc: 'Validates code against Manager checklist via feedback loop' },
    { num: 6, name: 'Finalizer Agent', desc: 'Executes compiler & Docker virtual runtime tests' },
  ];

  return (
    <div className="page-view active-view">
      <div className="pipeline-layout-grid">
        {/* Left: Agent Pipeline Nodes */}
        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">6-Agent Pipeline Workflow</h3>
          </div>
          <div className="agent-pipeline-tree">
            {stages.map((st, i) => {
              const isCompleted = currentStage > st.num;
              const isInProgress = currentStage === st.num;
              const statusClass = isCompleted ? 'completed' : isInProgress ? 'in-progress' : 'pending';

              return (
                <div key={st.num} className={`agent-pipeline-item ${statusClass}`}>
                  <div className="agent-pipeline-node">
                    {isCompleted ? '✓' : st.num}
                  </div>
                  <div className="agent-pipeline-details">
                    <h5 style={{ margin: '0 0 2px 0' }}>{st.name}</h5>
                    <span className="agent-pipeline-time" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {st.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Execution Monitor & Live Terminal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-panel">
            <div className="card-panel-header">
              <h3 className="card-panel-title">Execution State</h3>
              {currentStage >= 6 && onDownload && (
                <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={onDownload}>
                  Download Modernized ZIP
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Current Phase: </span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  {stages[Math.min(currentStage - 1, 5)]?.name || 'Ready'}
                </span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min(Math.round((currentStage / 6) * 100), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="card-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="card-panel-header">
              <h3 className="card-panel-title">Real-Time Agent Logs Console</h3>
              <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>● LIVE</span>
            </div>
            <div
              className="console-wrapper"
              ref={consoleRef}
              style={{ flex: 1, minHeight: '300px', maxHeight: '420px', overflowY: 'auto' }}
            >
              {logs.map((log, i) => (
                <div key={i} className="console-line">
                  <span className="console-time">[{log.time || '12:00:00'}]</span>
                  <span className="console-agent">[{log.agent}]</span>
                  <span
                    className="console-msg"
                    style={{
                      color:
                        log.level === 'error'
                          ? 'var(--color-danger)'
                          : log.level === 'warning'
                          ? 'var(--color-warning)'
                          : log.level === 'success'
                          ? 'var(--color-success)'
                          : 'inherit',
                    }}
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
