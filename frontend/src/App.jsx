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
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">A</div>
          <div className="logo-text">
            <h1>ALWUMS</h1>
            <p>Multi-Agent AI</p>
          </div>
        </div>

        <nav className="nav-list">
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
            Dashboard
          </div>

          <div
            className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Upgrade Wizard
          </div>

          <div
            className={`nav-item ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            <svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            Agent Pipeline
          </div>

          <div
            className={`nav-item ${activeTab === 'diff' ? 'active' : ''}`}
            onClick={() => setActiveTab('diff')}
          >
            <svg viewBox="0 0 24 24"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6M12 2v20"/></svg>
            Diff Viewer
          </div>

          <div
            className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <svg viewBox="0 0 24 24"><path d="M12 20h9M3 20h6M3 4h18M3 12h18M3 16h18M3 8h18"/></svg>
            MongoDB Logs
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">AI</div>
            <div className="user-details">
              <h4>System Pipeline</h4>
              <p>6 Active Agents</p>
            </div>
          </div>
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Switch Theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-title-container">
            <h2 style={{ textTransform: 'capitalize' }}>
              {activeTab === 'dashboard' ? 'Overview Dashboard' : activeTab.replace('-', ' ')}
            </h2>
          </div>
          <div className="header-right">
            <div className="server-status-pill">
              <span className="server-status-dot online"></span>
              Backend: <strong>Flask</strong> • DB: <strong>MongoDB</strong> • Frontend: <strong>React</strong>
            </div>
          </div>
        </header>

        <div className="view-viewport">
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
