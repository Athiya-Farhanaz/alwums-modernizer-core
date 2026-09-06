import React, { useState } from 'react';
import JSZip from 'jszip';

const PRESETS = [
  {
    id: 'react-flask-mongo',
    label: 'React.js Frontend & Python Flask + MongoDB (Recommended)',
    frontend: 'React.js (JSX/Hooks)',
    backend: 'Python (Flask)',
    db: 'MongoDB (NoSQL)'
  },
  {
    id: 'react-fastapi-postgres',
    label: 'React.js Frontend & Python FastAPI + PostgreSQL',
    frontend: 'React.js (JSX/Hooks)',
    backend: 'Python (FastAPI)',
    db: 'PostgreSQL (Relational SQL)'
  },
  {
    id: 'next-node-mongo',
    label: 'Next.js 14 (TypeScript) & Node.js Express + MongoDB',
    frontend: 'Next.js (TypeScript)',
    backend: 'Node.js (Express / TypeScript)',
    db: 'MongoDB (NoSQL)'
  },
  {
    id: 'angular-spring-postgres',
    label: 'Angular 17 (TypeScript) & Java Spring Boot + PostgreSQL',
    frontend: 'Angular (TypeScript)',
    backend: 'Java (Spring Boot)',
    db: 'PostgreSQL (Relational SQL)'
  },
  {
    id: 'vue-django-postgres',
    label: 'Vue.js 3 & Python Django + PostgreSQL',
    frontend: 'Vue.js 3',
    backend: 'Python (Django)',
    db: 'PostgreSQL (Relational SQL)'
  },
  {
    id: 'dotnet-sqlserver',
    label: 'C# ASP.NET Core Razor Pages & Web API + SQL Server',
    frontend: 'ASP.NET Core Razor / React.js',
    backend: 'C# (.NET Core Web API)',
    db: 'Microsoft SQL Server'
  },
  {
    id: 'react-go-postgres',
    label: 'React.js Frontend & Go (Golang Gin REST API) + PostgreSQL',
    frontend: 'React.js (JSX/Hooks)',
    backend: 'Go (Golang Gin)',
    db: 'PostgreSQL (Relational SQL)'
  },
  {
    id: 'laravel-mysql',
    label: 'PHP 8.3 Modern Laravel (MVC Architecture) + MySQL',
    frontend: 'Modern Blade / React.js',
    backend: 'PHP 8.3 (Laravel)',
    db: 'MySQL (Relational SQL)'
  },
  {
    id: 'custom',
    label: '⚙️ Custom Multi-Language Stack (Select Below)',
    frontend: 'React.js (JSX/Hooks)',
    backend: 'Python (Flask)',
    db: 'MongoDB (NoSQL)'
  }
];

export default function UploadWizard({ onStartPipeline }) {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('Legacy_Web_Portal');
  const [presetId, setPresetId] = useState('react-flask-mongo');
  const [frontendLang, setFrontendLang] = useState('React.js (JSX/Hooks)');
  const [backendLang, setBackendLang] = useState('Python (Flask)');
  const [databaseTech, setDatabaseTech] = useState('MongoDB (NoSQL)');
  const [instructions, setInstructions] = useState('');
  const [files, setFiles] = useState([]);
  const [zipBlob, setZipBlob] = useState(null);

  const handlePresetChange = (e) => {
    const selected = PRESETS.find(p => p.id === e.target.value);
    setPresetId(e.target.value);
    if (selected && selected.id !== 'custom') {
      setFrontendLang(selected.frontend);
      setBackendLang(selected.backend);
      setDatabaseTech(selected.db);
    }
  };

  const computedTargetStack = `${frontendLang} Frontend + ${backendLang} Backend + ${databaseTech}`;

  const handleFolderSelect = async (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;

    setFiles(selected);
    const zip = new JSZip();
    for (const f of selected) {
      const relPath = f.webkitRelativePath || f.name;
      zip.file(relPath, f);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    setZipBlob(content);
    setStep(2);
  };

  const handleStart = () => {
    if (!zipBlob) {
      alert('Please select files or a folder to modernize.');
      return;
    }
    onStartPipeline({
      projectName,
      targetTech: computedTargetStack,
      instructions,
      zipBlob,
      fileCount: files.length
    });
  };

  return (
    <div className="page-view active-view">
      <div className="card-panel" style={{ maxWidth: '900px', margin: '0 auto', padding: '36px' }}>
        {/* Wizard Steps Header */}
        <div className="wizard-steps-header">
          <div className={`wizard-step-indicator ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="wizard-step-number">{step > 1 ? '✓' : '1'}</div>
            <span>Upload Project</span>
          </div>

          <div className={`wizard-step-indicator ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="wizard-step-number">{step > 2 ? '✓' : '2'}</div>
            <span>Configure Target Languages</span>
          </div>

          <div className={`wizard-step-indicator ${step === 3 ? 'active' : ''}`}>
            <div className="wizard-step-number">3</div>
            <span>Review & Execute</span>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="wizard-step-pane active">
            <label className="drag-drop-zone" style={{ display: 'block' }}>
              <div className="upload-icon-wrapper">
                <svg style={{ width: '32px', height: '32px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }} viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              </div>
              <h3>Select or Drag Legacy Web Application Folder</h3>
              <p>Supports Classic ASP (.asp, .inc), Legacy PHP (.php), HTML, and VBScript files.</p>
              <span className="btn-primary" style={{ cursor: 'pointer' }}>
                Browse Folder
              </span>
              <input
                type="file"
                webkitdirectory="true"
                directory="true"
                multiple
                style={{ display: 'none' }}
                onChange={handleFolderSelect}
              />
            </label>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && (
          <div className="wizard-step-pane active">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                  Project Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                  Target Architecture Preset
                </label>
                <select
                  className="form-input"
                  value={presetId}
                  onChange={handlePresetChange}
                >
                  {PRESETS.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Granular Language / Framework Selectors */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Customize Target Modernization Languages
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Frontend Framework
                  </label>
                  <select
                    className="form-input"
                    value={frontendLang}
                    onChange={(e) => {
                      setFrontendLang(e.target.value);
                      setPresetId('custom');
                    }}
                  >
                    <option value="React.js (JSX/Hooks)">React.js (JSX / Hooks)</option>
                    <option value="Next.js (TypeScript)">Next.js 14 (TypeScript / SSR)</option>
                    <option value="Vue.js 3 (Composition API)">Vue.js 3 (Composition API)</option>
                    <option value="Angular (TypeScript)">Angular 17 (TypeScript)</option>
                    <option value="Modern HTML5 / CSS3 / ES6">Modern HTML5 & Vanilla JS</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Backend Language & Framework
                  </label>
                  <select
                    className="form-input"
                    value={backendLang}
                    onChange={(e) => {
                      setBackendLang(e.target.value);
                      setPresetId('custom');
                    }}
                  >
                    <option value="Python (Flask)">Python (Flask REST API)</option>
                    <option value="Python (FastAPI)">Python (FastAPI Async)</option>
                    <option value="Python (Django)">Python (Django MVC)</option>
                    <option value="Node.js (Express / TypeScript)">Node.js (Express & TS)</option>
                    <option value="Java (Spring Boot)">Java (Spring Boot Enterprise)</option>
                    <option value="C# (.NET Core Web API)">C# (ASP.NET Core Web API)</option>
                    <option value="Go (Golang Gin)">Go (Golang Gin / Fiber)</option>
                    <option value="PHP 8.3 (Laravel)">PHP 8.3 (Modern Laravel)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Database Technology
                  </label>
                  <select
                    className="form-input"
                    value={databaseTech}
                    onChange={(e) => {
                      setDatabaseTech(e.target.value);
                      setPresetId('custom');
                    }}
                  >
                    <option value="MongoDB (NoSQL)">MongoDB (NoSQL Document Store)</option>
                    <option value="PostgreSQL (Relational SQL)">PostgreSQL (Relational SQL)</option>
                    <option value="MySQL (Relational SQL)">MySQL (Relational SQL)</option>
                    <option value="SQLite (Embedded)">SQLite (Embedded SQL)</option>
                    <option value="Microsoft SQL Server">Microsoft SQL Server</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                Custom Modernization Directives (Optional)
              </label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="e.g. Translate SQL queries to MongoDB NoSQL syntax; decouple business logic into React hooks..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>&lt; Back</button>
              <button className="btn-primary" onClick={() => setStep(3)}>Next: Review &gt;</button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="wizard-step-pane active">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr',
                gap: '14px',
                fontSize: '14px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '20px'
              }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Project Name:</span>
                <span style={{ fontWeight: 700 }}>{projectName}</span>

                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Scanned Files:</span>
                <span>{files.length} file(s) ready for migration</span>

                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Target Architecture:</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{computedTargetStack}</span>

                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Frontend Stack:</span>
                <span>{frontendLang}</span>

                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Backend Framework:</span>
                <span>{backendLang}</span>

                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Database Target:</span>
                <span>{databaseTech}</span>

                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Autonomous Agents:</span>
                <span>Discovery → Manager → Prompt Maker → Execution → Validator → Finalizer</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>&lt; Back</button>
              <button className="btn-primary" onClick={handleStart}>
                🚀 Launch Modernization Pipeline
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
