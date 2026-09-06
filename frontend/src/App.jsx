import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import PipelineTracker from './components/PipelineTracker';
import DiffViewer from './components/DiffViewer';
import LogsView from './components/LogsView';
import UploadWizard from './components/UploadWizard';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('alwums-theme') || 'light');
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pipelineState, setPipelineState] = useState({ stage: 1, active: false, downloadBlob: null });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('alwums-theme', theme);
  }, [theme]);

  // Fetch projects and logs from Flask & MongoDB backend
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('/api/logs')
      .then(res => res.json())
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleStartPipeline = async ({ projectName, targetTech, zipBlob }) => {
    setActiveTab('pipeline');
    setPipelineState({ stage: 1, active: true, downloadBlob: null });

    // Stream stage transitions for real-time visual feedback
    const stageTimeline = [
      { s: 1, agent: 'Discovery Agent', msg: `Scanning project directory for ${projectName}...` },
      { s: 2, agent: 'Manager Agent', msg: 'Decomposing legacy code into modernization task checklist...' },
      { s: 3, agent: 'Prompt Maker Agent', msg: 'Building context-aware prompts with cross-file dependencies...' },
      { s: 4, agent: 'Execution Agent', msg: `Modernizing components into ${targetTech}...` },
      { s: 5, agent: 'Validator Agent', msg: 'Validating code against Manager tasks via feedback loop...' },
      { s: 6, agent: 'Finalizer Agent', msg: 'Running compiler and virtual runtime checks (Docker / Subprocess)...' }
    ];

    for (const item of stageTimeline) {
      setPipelineState(prev => ({ ...prev, stage: item.s }));
      setLogs(prev => [
        {
          time: new Date().toLocaleTimeString(),
          agent: item.agent,
          level: 'info',
          message: item.msg
        },
        ...prev
      ]);
      await new Promise(r => setTimeout(r, 1200));
    }

    // Send actual ZIP to Flask backend
    try {
      const formData = new FormData();
      formData.append('project', zipBlob, `${projectName}.zip`);
      formData.append('projectName', projectName);
      formData.append('targetTech', targetTech);

      const res = await fetch('/upgrade', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const blob = await res.blob();
        setPipelineState(prev => ({ ...prev, stage: 6, active: false, downloadBlob: blob }));
        setLogs(prev => [
          {
            time: new Date().toLocaleTimeString(),
            agent: 'Finalizer Agent',
            level: 'success',
            message: `Upgrade complete! Output packaged as ${projectName}_modernized.zip`
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Pipeline error:', err);
    }
  };

  const handleDownload = () => {
    if (!pipelineState.downloadBlob) return;
    const url = window.URL.createObjectURL(pipelineState.downloadBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modernized_project.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h1 className="brand-title">ALWUMS</h1>
            <span className="brand-badge">Multi-Agent AI</span>
          </div>
        </div>

        <nav className="nav-menu">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'upload', label: 'Upgrade Wizard', icon: '⚡' },
            { id: 'pipeline', label: 'Agent Pipeline', icon: '🤖' },
            { id: 'diff', label: 'Diff Viewer', icon: '🔍' },
            { id: 'logs', label: 'MongoDB Logs', icon: '📋' }
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            className="btn-secondary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={toggleTheme}
          >
            <span>{theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <div>
            <h2 className="header-title" style={{ textTransform: 'capitalize' }}>
              {activeTab.replace('-', ' ')}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Backend: <strong>Flask</strong> • DB: <strong>MongoDB</strong> • Frontend: <strong>React</strong>
            </span>
          </div>
        </header>

        <div className="content-body">
          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} projects={projects} />}
          {activeTab === 'upload' && <UploadWizard onStartPipeline={handleStartPipeline} />}
          {activeTab === 'pipeline' && (
            <PipelineTracker
              logs={logs}
              currentStage={pipelineState.stage}
              onDownload={pipelineState.downloadBlob ? handleDownload : null}
            />
          )}
          {activeTab === 'diff' && <DiffViewer />}
          {activeTab === 'logs' && <LogsView logs={logs} />}
        </div>
      </main>
    </div>
  );
}
