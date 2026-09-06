import React from 'react';

export default function Dashboard({ onNavigate, projects }) {
  return (
    <div className="page-view active-view">
      {/* Tech Stack Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--accent-gradient)',
        color: '#ffffff',
        padding: '16px 24px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>
            ALWUMS Multi-Agent Modernization Platform
          </h4>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
            Autonomous legacy modernization powered by a 6-agent pipeline with self-healing auto-repair.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Python', 'Flask', 'React.js', 'MongoDB', 'Gemini AI'].map(tech => (
            <span key={tech} style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              backdropFilter: 'blur(4px)'
            }}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Projects</span>
            <div className="metric-icon">📁</div>
          </div>
          <div className="metric-value">12</div>
          <span className="metric-change positive">+2 this week</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Completed Migrations</span>
            <div className="metric-icon">✅</div>
          </div>
          <div className="metric-value">8</div>
          <span className="metric-change positive">100% verified</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">In Progress</span>
            <div className="metric-icon">⚙️</div>
          </div>
          <div className="metric-value">3</div>
          <span className="metric-change" style={{ color: 'var(--color-warning)' }}>Active runs</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Success Rate</span>
            <div className="metric-icon">📈</div>
          </div>
          <div className="metric-value">92%</div>
          <span className="metric-change positive">Self-healed 4 files</span>
        </div>
      </div>

      {/* Pipeline Overview & Time Saved Split */}
      <div className="card-panel" style={{ marginBottom: '24px' }}>
        <div className="card-panel-header">
          <h3 className="card-panel-title">6-Agent Pipeline Overview</h3>
          <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => onNavigate('upload')}>
            + New Modernization
          </button>
        </div>
        <div className="pipeline-overview-bar">
          {[
            { num: 1, name: 'Discovery Agent', status: 'completed' },
            { num: 2, name: 'Manager Agent', status: 'completed' },
            { num: 3, name: 'Prompt Maker Agent', status: 'completed' },
            { num: 4, name: 'Execution Agent', status: 'completed' },
            { num: 5, name: 'Validator Agent', status: 'completed' },
            { num: 6, name: 'Finalizer Agent', status: 'active' }
          ].map(node => (
            <div key={node.num} className={`pipeline-step-node ${node.status}`}>
              <div className="pipeline-step-dot">{node.num}</div>
              <span className="pipeline-step-name">{node.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-layout-split">
        {/* Circular Gauge: 78% Time Saved */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="card-panel-header" style={{ width: '100%' }}>
            <h3 className="card-panel-title">Modernization Time Saved</h3>
          </div>
          <div className="circular-gauge-container">
            <svg className="circular-gauge-svg" viewBox="0 0 160 160">
              <circle className="circular-gauge-bg" cx="80" cy="80" r="65"></circle>
              <circle className="circular-gauge-bar" cx="80" cy="80" r="65" style={{ strokeDashoffset: 90 }}></circle>
            </svg>
            <div className="circular-gauge-text">
              <span className="circular-gauge-percent">78%</span>
              <span className="circular-gauge-label">Faster vs Manual</span>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Calculated across multi-file legacy refactoring benchmarks.
          </p>
        </div>

        {/* Recent Modernizations Table (from MongoDB) */}
        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">Recent Migrations (MongoDB)</h3>
            <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => onNavigate('projects')}>
              View All
            </button>
          </div>
          <div className="datatable-wrapper">
            <table className="datatable">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Source Tech</th>
                  <th>Status</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 4).map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{p.tech}</td>
                    <td>
                      <span className={`status-pill status-${p.status}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="progress-bar-bg" style={{ width: '80px', height: '6px' }}>
                        <div className="progress-bar-fill" style={{ width: `${p.progress}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
