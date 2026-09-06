import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import Dashboard from './components/Dashboard';
import ProjectsList from './components/ProjectsList';
import UploadWizard from './components/UploadWizard';
import PipelineTracker from './components/PipelineTracker';
import AnalyzerReport from './components/AnalyzerReport';
import DiffViewer from './components/DiffViewer';
import FinalOutput from './components/FinalOutput';
import SettingsView from './components/SettingsView';
import LogsView from './components/LogsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('alwums-theme') || 'light');
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [projectName, setProjectName] = useState('Inventory_System');
  const [selectedTargetTech, setSelectedTargetTech] = useState('Python (Flask)');
  const [pipelineState, setPipelineState] = useState({ stage: 0, active: false, downloadBlob: null, error: null });
  const [customFiles, setCustomFiles] = useState({});

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

  const handleStartPipeline = async ({ projectName: pName, targetTech, instructions, zipBlob, originalFiles }) => {
    setProjectName(pName);
    setSelectedTargetTech(targetTech);
    setActiveTab('pipeline');
    setPipelineState({ stage: 1, active: true, downloadBlob: null, error: null });

    const stageTimeline = [
      { s: 1, agent: 'Discovery Agent', msg: `Scanning legacy codebase for ${pName}...` },
      { s: 2, agent: 'Manager Agent', msg: 'Decomposing legacy components into task checklist...' },
      { s: 3, agent: 'Prompt Maker Agent', msg: 'Synthesizing context-aware execution prompts...' },
      { s: 4, agent: 'Execution Agent', msg: `Generating modernized ${targetTech} code...` },
      { s: 5, agent: 'Validator Agent', msg: 'Validating code against manager checklist via feedback loop...' },
      { s: 6, agent: 'Finalizer Agent', msg: 'Executing compiler checks and packaging distribution archive...' }
    ];

    // Progression timer to reflect multi-agent orchestration
    const progressInterval = setInterval(() => {
      setPipelineState(prev => {
        if (!prev.active || prev.stage >= 5) return prev;
        const nextStage = prev.stage + 1;
        const item = stageTimeline[nextStage - 1];
        if (item) {
          setLogs(l => [
            {
              time: new Date().toLocaleTimeString(),
              agent: item.agent,
              level: 'info',
              message: item.msg
            },
            ...l
          ]);
        }
        return { ...prev, stage: nextStage };
      });
    }, 1800);

    try {
      const formData = new FormData();
      formData.append('project', zipBlob, `${pName}.zip`);
      formData.append('projectName', pName);
      formData.append('targetTech', targetTech);
      if (instructions) {
        formData.append('instructions', instructions);
      }

      const res = await fetch('/upgrade', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (res.ok) {
        const blob = await res.blob();
        setPipelineState({ stage: 6, active: false, downloadBlob: blob, error: null });
        setLogs(prev => [
          {
            time: new Date().toLocaleTimeString(),
            agent: 'Finalizer Agent',
            level: 'success',
            message: `Upgrade complete! Output packaged as ${pName}_modernized.zip`
          },
          ...prev
        ]);

        // Unpack upgraded files from response zip and populate Diff Viewer dynamically
        try {
          const zip = await JSZip.loadAsync(blob);
          const customMap = {};
          const originalMap = {};

          if (originalFiles && originalFiles.length) {
            for (const f of originalFiles) {
              const rel = f.webkitRelativePath || f.name;
              try {
                const txt = await f.text();
                originalMap[rel] = txt;
                originalMap[f.name] = txt;
              } catch (e) {}
            }
          }

          const filePromises = [];
          zip.forEach((relPath, zipEntry) => {
            if (!zipEntry.dir && !relPath.endsWith('.html') && !relPath.endsWith('.zip')) {
              filePromises.push(
                zipEntry.async('text').then(text => {
                  const baseName = relPath.split('/').pop();
                  const origCode = originalMap[relPath] || originalMap[baseName] || '// Legacy source code';
                  customMap[baseName] = {
                    targetLanguage: targetTech,
                    category: 'custom',
                    originalTitle: `Original Legacy (${baseName})`,
                    modernizedTitle: `Modernized Output (${baseName})`,
                    original: origCode,
                    modernized: text
                  };
                })
              );
            }
          });

          await Promise.all(filePromises);
          if (Object.keys(customMap).length > 0) {
            setCustomFiles(customMap);
          }
        } catch (zipErr) {
          console.warn('Could not extract files for diff viewer:', zipErr);
        }

        // Live refresh projects & logs from backend
        fetch('/api/projects')
          .then(r => r.json())
          .then(data => setProjects(Array.isArray(data) ? data : []))
          .catch(() => {});

        fetch('/api/logs')
          .then(r => r.json())
          .then(data => setLogs(Array.isArray(data) ? data : []))
          .catch(() => {});
      } else {
        const errJson = await res.json().catch(() => ({ error: 'Modernization request failed' }));
        clearInterval(progressInterval);
        setPipelineState(prev => ({ ...prev, active: false, error: errJson.error }));
        setLogs(prev => [
          {
            time: new Date().toLocaleTimeString(),
            agent: 'Finalizer Agent',
            level: 'error',
            message: `Pipeline failed: ${errJson.error || 'Server error'}`
          },
          ...prev
        ]);
        alert(`Modernization error: ${errJson.error || 'Server error occurred'}`);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setPipelineState(prev => ({ ...prev, active: false, error: err.message }));
      console.error('Pipeline error:', err);
    }
  };

  const handleDownload = () => {
    if (!pipelineState.downloadBlob) return;
    const url = window.URL.createObjectURL(pipelineState.downloadBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase()}_modernized.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const getPageHeader = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard', sub: 'Monitor your modernization pipeline and projects' };
      case 'projects':
        return { title: 'Projects', sub: 'Manage and monitor all legacy modernization repositories' };
      case 'upload':
        return { title: 'New Project / Upload', sub: 'Drop your Classic ASP or PHP project to begin automated upgrade' };
      case 'pipeline':
        return { title: `Project: ${projectName}`, sub: '6-Agent autonomous execution pipeline and live status' };
      case 'reports':
        return { title: `Project: ${projectName} > Analyzer Report`, sub: 'Automated legacy codebase structure and complexity analysis' };
      case 'diff':
        return { title: `Project: ${projectName} > Code Diff`, sub: 'Side-by-side legacy code vs. modernized code comparison' };
      case 'output':
        return { title: `Project: ${projectName} > Final Output`, sub: 'Verification summary and modernized distribution package' };
      case 'settings':
        return { title: 'Settings', sub: 'Configure LLM inference models, temperature, and tokens' };
      case 'logs':
        return { title: 'Logs', sub: 'Audit stream of all multi-agent activities and runtime events' };
      default:
        return { title: 'ALWUMS Platform', sub: 'Autonomous Legacy Modernization Engine' };
    }
  };

  const headerInfo = getPageHeader();

  return (
    <div className="app-container">
      {/* Sidebar Navigation (Matching Image 1 & 2 Blueprint) */}
      <aside className="sidebar">
        {/* Brand Logo Header */}
        <div className="logo-container">
          <div className="logo-icon">A</div>
          <div className="logo-text">
            <h1>ALWUMS</h1>
            <p>Autonomous Legacy Web Application Upgrade using Multi-agent System</p>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="nav-list">
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Dashboard
          </div>

          <div
            className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            Projects
          </div>

          <div
            className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Project
          </div>

          <div
            className={`nav-item ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Agent Pipeline
          </div>

          <div
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Reports
          </div>

          <div
            className={`nav-item ${activeTab === 'diff' ? 'active' : ''}`}
            onClick={() => setActiveTab('diff')}
          >
            <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Code Diff
          </div>

          <div
            className={`nav-item ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => setActiveTab('output')}
          >
            <svg viewBox="0 0 24 24"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            Final Output
          </div>

          <div
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </div>

          <div
            className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Logs
          </div>

          <div
            className={`nav-item ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Help
          </div>
        </nav>

        {/* Sidebar Footer User Profile (Matching Image 2) */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">AM</div>
            <div className="user-details">
              <h4>Admin User</h4>
              <p>admin@alwums.local</p>
            </div>
          </div>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="main-content">
        <header className="main-header" style={{ height: '70px', padding: '0 32px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {headerInfo.title}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              {headerInfo.sub}
            </p>
          </div>

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-primary)'
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative', cursor: 'pointer' }} title="System Operational">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#3b82f6',
                boxShadow: '0 0 6px #3b82f6'
              }}></span>
            </div>

            {/* Header User Avatar */}
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#3b82f6',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              AM
            </div>
          </div>
        </header>

        {/* View Viewport */}
        <div className="view-viewport" style={{ padding: '24px 32px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && (
            <Dashboard onNavigate={setActiveTab} projects={projects} />
          )}

          {activeTab === 'projects' && (
            <ProjectsList
              projects={projects}
              onNavigate={setActiveTab}
              onSelectProject={(proj) => {
                setProjectName(proj.name);
                setSelectedTargetTech(proj.tech);
                setActiveTab('diff');
              }}
            />
          )}

          {activeTab === 'upload' && (
            <UploadWizard onStartPipeline={handleStartPipeline} onNavigate={setActiveTab} />
          )}

          {activeTab === 'pipeline' && (
            <PipelineTracker
              logs={logs}
              currentStage={pipelineState.stage}
              projectName={projectName}
              targetTech={selectedTargetTech}
              error={pipelineState.error}
              onDownload={pipelineState.downloadBlob ? handleDownload : null}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'reports' && (
            <AnalyzerReport projectName={projectName} onNavigate={setActiveTab} />
          )}

          {activeTab === 'diff' && (
            <DiffViewer targetTech={selectedTargetTech} customFiles={customFiles} projectName={projectName} />
          )}

          {activeTab === 'output' && (
            <FinalOutput
              projectName={projectName}
              targetTech={selectedTargetTech}
              downloadBlob={pipelineState.downloadBlob}
              onDownload={handleDownload}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView theme={theme} setTheme={setTheme} />
          )}

          {activeTab === 'logs' && (
            <LogsView logs={logs} />
          )}

          {activeTab === 'help' && (
            <div className="page-view active-view">
              <div className="card-panel" style={{ maxWidth: '840px', margin: '0 auto', padding: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
                  ALWUMS Platform Documentation & Help
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                  <strong>ALWUMS</strong> (Autonomous Legacy Web Application Upgrade System) uses a cooperative 6-agent architecture to modernize monolithic legacy codebases (such as Classic ASP, legacy PHP, and ASP.NET) into modern architectures.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: '#3b82f6' }}>1. Discovery Agent</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Scans file trees, AST structures, database calls, session handlers, and legacy patterns.</p>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: '#3b82f6' }}>2. Manager Agent</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Constructs dependency graph, orchestrates migration order, and creates execution tasks.</p>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: '#3b82f6' }}>3. Prompt Maker Agent</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Synthesizes cross-file symbol context and user directives into code transformation prompts.</p>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: '#3b82f6' }}>4. Execution Agent</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Transforms legacy logic into target modern framework code with idiomatic design patterns.</p>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: '#3b82f6' }}>5. Validator Agent</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Executes a feedback loop against task requirements to detect regressions or missing functions.</p>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: '#3b82f6' }}>6. Finalizer Agent</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Runs real compilers, linter checks, self-heals syntax errors, and packages the verified archive.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-primary" onClick={() => setActiveTab('upload')}>
                    Start New Migration
                  </button>
                  <button className="btn-outline" onClick={() => setActiveTab('dashboard')}>
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
