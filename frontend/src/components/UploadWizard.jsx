import React, { useState } from 'react';
import JSZip from 'jszip';

export default function UploadWizard({ onStartPipeline }) {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('Legacy_Web_Portal');
  const [targetTech, setTargetTech] = useState('React.js Frontend & Python Flask + MongoDB');
  const [instructions, setInstructions] = useState('');
  const [files, setFiles] = useState([]);
  const [zipBlob, setZipBlob] = useState(null);

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
      targetTech,
      instructions,
      zipBlob,
      fileCount: files.length
    });
  };

  return (
    <div className="page-view active-view">
      <div className="card-panel" style={{ maxWidth: '850px', margin: '0 auto', padding: '36px' }}>
        {/* Wizard Steps Header */}
        <div className="wizard-steps-header">
          <div className={`wizard-step-indicator ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="wizard-step-number">{step > 1 ? '✓' : '1'}</div>
            <span>Upload Project</span>
          </div>

          <div className={`wizard-step-indicator ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="wizard-step-number">{step > 2 ? '✓' : '2'}</div>
            <span>Configure Architecture</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
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
                  Target Architecture
                </label>
                <select
                  className="form-input"
                  value={targetTech}
                  onChange={(e) => setTargetTech(e.target.value)}
                >
                  <option value="React.js Frontend & Python Flask + MongoDB">
                    React.js Frontend & Python Flask + MongoDB (Recommended)
                  </option>
                  <option value="React.js Frontend & FastAPI + MongoDB">
                    React.js Frontend & FastAPI + MongoDB
                  </option>
                  <option value="ASP.NET Core Razor Pages">
                    ASP.NET Core Razor Pages (C#)
                  </option>
                  <option value="Node.js Express & React.js">
                    Node.js Express & React.js
                  </option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                  Custom Modernization Directives (Optional)
                </label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="e.g. Translate SQL queries to MongoDB NoSQL syntax; decouple business logic into React hooks..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
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
                gridTemplateColumns: '160px 1fr',
                gap: '14px',
                fontSize: '14px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '20px'
              }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Project Name:</span>
                <span style={{ fontWeight: 700 }}>{projectName}</span>

                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Scanned Files:</span>
                <span>{files.length} file(s) ready for migration</span>

                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Target Stack:</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{targetTech}</span>

                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Autonomous Agents:</span>
                <span>Discovery → Manager → Prompt Maker → Execution → Validator → Finalizer</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>&lt; Back</button>
              <button className="btn-primary" onClick={handleStart}>
                🚀 Launch 6-Agent Modernization
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
