import React, { useState } from 'react';
import JSZip from 'jszip';

export const SINGLE_LANGUAGE_PRESETS = [
  {
    id: 'csharp-dotnet',
    label: 'C# ASP.NET Core 8 (Razor Pages & Web API)',
    mode: 'single',
    language: 'C#',
    category: 'csharp',
    frontend: 'ASP.NET Core Razor Pages',
    backend: 'C# (.NET Core Web API)',
    db: 'Microsoft SQL Server',
    display: 'C# (ASP.NET Core 8 Razor & Web API)'
  },
  {
    id: 'python-flask',
    label: 'Python (Flask Web Application & REST API)',
    mode: 'single',
    language: 'Python',
    category: 'python',
    frontend: 'Flask Jinja2 / Modern HTML5',
    backend: 'Python (Flask)',
    db: 'MongoDB (NoSQL)',
    display: 'Python (Flask Web Application & REST API)'
  },
  {
    id: 'python-fastapi',
    label: 'Python (FastAPI High-Performance Async)',
    mode: 'single',
    language: 'Python',
    category: 'python',
    frontend: 'FastAPI Swagger / HTML5',
    backend: 'Python (FastAPI)',
    db: 'PostgreSQL (Relational SQL)',
    display: 'Python (FastAPI Async API)'
  },
  {
    id: 'nodejs-express',
    label: 'JavaScript / TypeScript (Node.js & Express)',
    mode: 'single',
    language: 'TypeScript',
    category: 'nodejs',
    frontend: 'Modern HTML5 / ES6',
    backend: 'Node.js (Express / TypeScript)',
    db: 'MongoDB (NoSQL)',
    display: 'JavaScript / TypeScript (Node.js & Express)'
  },
  {
    id: 'java-spring',
    label: 'Java (Spring Boot 3 Enterprise MVC & REST)',
    mode: 'single',
    language: 'Java',
    category: 'java',
    frontend: 'Thymeleaf / HTML5',
    backend: 'Java (Spring Boot)',
    db: 'PostgreSQL (Relational SQL)',
    display: 'Java (Spring Boot 3 Enterprise)'
  },
  {
    id: 'php-laravel',
    label: 'PHP 8.3 (Modern Laravel MVC Framework)',
    mode: 'single',
    language: 'PHP',
    category: 'php',
    frontend: 'Modern Blade Templates',
    backend: 'PHP 8.3 (Laravel)',
    db: 'MySQL (Relational SQL)',
    display: 'PHP 8.3 (Modern Laravel MVC)'
  },
  {
    id: 'golang-gin',
    label: 'Go (Golang Gin Microservices REST API)',
    mode: 'single',
    language: 'Go',
    category: 'golang',
    frontend: 'Modern HTML5 / Web API',
    backend: 'Go (Golang Gin)',
    db: 'PostgreSQL (Relational SQL)',
    display: 'Go (Golang Gin Microservices)'
  }
];

export const FULLSTACK_PRESETS = [
  {
    id: 'react-flask-mongo',
    label: 'React.js Frontend + Python Flask & MongoDB (Recommended)',
    mode: 'fullstack',
    language: 'React + Python',
    category: 'react',
    frontend: 'React.js (JSX/Hooks)',
    backend: 'Python (Flask)',
    db: 'MongoDB (NoSQL)',
    display: 'React.js Frontend + Python Flask & MongoDB'
  },
  {
    id: 'react-fastapi-postgres',
    label: 'React.js Frontend + Python FastAPI & PostgreSQL',
    mode: 'fullstack',
    language: 'React + Python',
    category: 'react',
    frontend: 'React.js (JSX/Hooks)',
    backend: 'Python (FastAPI)',
    db: 'PostgreSQL (Relational SQL)',
    display: 'React.js Frontend + Python FastAPI & PostgreSQL'
  },
  {
    id: 'next-node-mongo',
    label: 'Next.js 14 (TypeScript) + Node.js Express & MongoDB',
    mode: 'fullstack',
    language: 'Next.js + Node.js',
    category: 'nodejs',
    frontend: 'Next.js (TypeScript)',
    backend: 'Node.js (Express / TypeScript)',
    db: 'MongoDB (NoSQL)',
    display: 'Next.js 14 + Node.js Express & MongoDB'
  },
  {
    id: 'angular-spring-postgres',
    label: 'Angular 17 (TypeScript) + Java Spring Boot & PostgreSQL',
    mode: 'fullstack',
    language: 'Angular + Java',
    category: 'java',
    frontend: 'Angular (TypeScript)',
    backend: 'Java (Spring Boot)',
    db: 'PostgreSQL (Relational SQL)',
    display: 'Angular 17 + Java Spring Boot & PostgreSQL'
  },
  {
    id: 'vue-django-postgres',
    label: 'Vue.js 3 + Python Django & PostgreSQL',
    mode: 'fullstack',
    language: 'Vue + Python',
    category: 'python',
    frontend: 'Vue.js 3',
    backend: 'Python (Django)',
    db: 'PostgreSQL (Relational SQL)',
    display: 'Vue.js 3 + Python Django & PostgreSQL'
  }
];

export default function UploadWizard({ onStartPipeline }) {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('Legacy_Web_Portal');
  const [presetId, setPresetId] = useState('csharp-dotnet');
  const [frontendLang, setFrontendLang] = useState('ASP.NET Core Razor Pages');
  const [backendLang, setBackendLang] = useState('C# (.NET Core Web API)');
  const [databaseTech, setDatabaseTech] = useState('Microsoft SQL Server');
  const [instructions, setInstructions] = useState('');
  const [files, setFiles] = useState([]);
  const [zipBlob, setZipBlob] = useState(null);

  const allPresets = [...SINGLE_LANGUAGE_PRESETS, ...FULLSTACK_PRESETS];
  const activePreset = allPresets.find(p => p.id === presetId);

  const handlePresetChange = (e) => {
    const targetId = e.target.value;
    setPresetId(targetId);
    const selected = allPresets.find(p => p.id === targetId);
    if (selected) {
      setFrontendLang(selected.frontend);
      setBackendLang(selected.backend);
      setDatabaseTech(selected.db);
    }
  };

  const computedTargetStack = presetId === 'custom'
    ? `${frontendLang} Frontend + ${backendLang} Backend + ${databaseTech}`
    : (activePreset ? activePreset.display : `${frontendLang} + ${backendLang} + ${databaseTech}`);

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
      presetId,
      targetCategory: activePreset?.category || 'all',
      instructions,
      zipBlob,
      fileCount: files.length
    });
  };

  return (
    <div className="page-view active-view">
      <div className="card-panel" style={{ maxWidth: '920px', margin: '0 auto', padding: '36px' }}>
        {/* Wizard Steps Header */}
        <div className="wizard-steps-header">
          <div className={`wizard-step-indicator ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="wizard-step-number">{step > 1 ? '✓' : '1'}</div>
            <span>Upload Project</span>
          </div>

          <div className={`wizard-step-indicator ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="wizard-step-number">{step > 2 ? '✓' : '2'}</div>
            <span>Configure Target Language</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px', marginBottom: '24px' }}>
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
                  Target Modernization Language / Stack
                </label>
                <select
                  className="form-input"
                  value={presetId}
                  onChange={handlePresetChange}
                >
                  <optgroup label="Single Modern Languages / Frameworks">
                    {SINGLE_LANGUAGE_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Decoupled Full-Stack Stacks (Frontend + Backend + DB)">
                    {FULLSTACK_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Custom Multi-Language Configuration">
                    <option value="custom">⚙️ Custom Multi-Language Stack (Configure Below)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Explanatory Banner */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '18px' }}>💡</span>
              <div style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                {activePreset?.mode === 'single' ? (
                  <span>
                    <strong>Single Language Target:</strong> Upgrades your legacy code into a cohesive, unmixed <strong>{activePreset.language}</strong> application ({activePreset.display}) with modern security and clean architecture.
                  </span>
                ) : activePreset?.mode === 'fullstack' ? (
                  <span>
                    <strong>Decoupled Full-Stack:</strong> Splits legacy monolithic code into a modern Single-Page Application frontend ({activePreset.frontend}) and a dedicated backend REST API ({activePreset.backend}).
                  </span>
                ) : (
                  <span>
                    <strong>Custom Stack:</strong> Mix and match individual frontend, backend, and database technologies below to meet your custom enterprise requirements.
                  </span>
                )}
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
                Language & Technology Breakdown
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Frontend / UI Layer
                  </label>
                  <select
                    className="form-input"
                    value={frontendLang}
                    onChange={(e) => {
                      setFrontendLang(e.target.value);
                      setPresetId('custom');
                    }}
                  >
                    <option value="ASP.NET Core Razor Pages">ASP.NET Core Razor Pages (C#)</option>
                    <option value="Flask Jinja2 / Modern HTML5">Flask Jinja2 / HTML5 (Python)</option>
                    <option value="FastAPI Swagger / HTML5">FastAPI Swagger / HTML5</option>
                    <option value="React.js (JSX/Hooks)">React.js (JSX / Hooks)</option>
                    <option value="Next.js (TypeScript)">Next.js 14 (TypeScript / SSR)</option>
                    <option value="Vue.js 3 (Composition API)">Vue.js 3 (Composition API)</option>
                    <option value="Angular (TypeScript)">Angular 17 (TypeScript)</option>
                    <option value="Modern Blade Templates">Modern Blade Templates (PHP)</option>
                    <option value="Modern HTML5 / ES6">Modern HTML5 & Vanilla ES6</option>
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
                    <option value="C# (.NET Core Web API)">C# (ASP.NET Core 8 Web API)</option>
                    <option value="Python (Flask)">Python (Flask REST API)</option>
                    <option value="Python (FastAPI)">Python (FastAPI Async)</option>
                    <option value="Python (Django)">Python (Django MVC)</option>
                    <option value="Node.js (Express / TypeScript)">Node.js (Express & TS)</option>
                    <option value="Java (Spring Boot)">Java (Spring Boot Enterprise)</option>
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
                    <option value="Microsoft SQL Server">Microsoft SQL Server</option>
                    <option value="MongoDB (NoSQL)">MongoDB (NoSQL Document Store)</option>
                    <option value="PostgreSQL (Relational SQL)">PostgreSQL (Relational SQL)</option>
                    <option value="MySQL (Relational SQL)">MySQL (Relational SQL)</option>
                    <option value="SQLite (Embedded)">SQLite (Embedded SQL)</option>
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
                placeholder="e.g. Translate SQL queries to parameterized statements; enforce anti-CSRF tokens; modularize components..."
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

                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Modernization Type:</span>
                <span>{activePreset?.mode === 'single' ? 'Unified Single-Language Architecture' : 'Decoupled Full-Stack Architecture'}</span>

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
