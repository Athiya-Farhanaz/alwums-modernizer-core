import React, { useState, useEffect } from 'react';

const PROVIDER_MODELS = {
  gemini: [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fastest / Recommended)' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Deep Reasoning)' }
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o (Omni Architecture)' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'o1-preview', label: 'OpenAI o1 Reasoning' }
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' }
  ],
  local: [
    { value: 'deepseek-coder:6.7b', label: 'DeepSeek Coder 6.7B (Ollama)' },
    { value: 'llama3:8b', label: 'Llama 3 8B (Ollama)' },
    { value: 'qwen2.5-coder:7b', label: 'Qwen 2.5 Coder 7B' }
  ]
};

export default function SettingsView({ theme, setTheme }) {
  const [activeSection, setActiveSection] = useState('llm');
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [temperature, setTemperature] = useState(0.0);
  const [maxTokens, setMaxTokens] = useState(8192);
  const [saved, setSaved] = useState(false);
  const [sandboxMode, setSandboxMode] = useState('docker');

  const sections = [
    { id: 'general', label: 'General' },
    { id: 'llm', label: 'LLM Configuration' },
    { id: 'agents', label: 'Agent Settings' },
    { id: 'security', label: 'Security & Sandbox' },
    { id: 'advanced', label: 'Advanced Telemetry' }
  ];

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.provider) setProvider(data.provider);
        if (data.model) setModel(data.model);
        if (data.apiKey) setApiKey(data.apiKey);
        if (data.temperature !== undefined) setTemperature(data.temperature);
        if (data.maxTokens) setMaxTokens(data.maxTokens);
      })
      .catch(() => {});
  }, []);

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    const models = PROVIDER_MODELS[newProvider] || [];
    if (models.length > 0) {
      setModel(models[0].value);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          apiKey,
          temperature,
          maxTokens
        })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Could not save settings to server: ' + err.message);
    }
  };

  const availableModels = PROVIDER_MODELS[provider] || PROVIDER_MODELS.gemini;

  return (
    <div className="page-view active-view">
      <div className="card-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
          Settings & Configuration
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px' }}>
          {/* Sub Navigation Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
            {sections.map(sec => (
              <div
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: activeSection === sec.id ? 600 : 500,
                  color: activeSection === sec.id ? '#3b82f6' : 'var(--text-secondary)',
                  background: activeSection === sec.id ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {sec.label}
              </div>
            ))}
          </div>

          {/* Settings Content Pane */}
          <div>
            {activeSection === 'llm' && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
                  LLM Intelligence Engine
                </h4>

                <form onSubmit={handleSave} style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      Provider
                    </label>
                    <select
                      className="form-input"
                      value={provider}
                      onChange={(e) => handleProviderChange(e.target.value)}
                    >
                      <option value="gemini">Google Gemini AI (Active / Live)</option>
                      <option value="openai">OpenAI (GPT-4o & Mini)</option>
                      <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                      <option value="local">Local Ollama (DeepSeek / Llama 3)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      Model
                    </label>
                    <select
                      className="form-input"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    >
                      {availableModels.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      API Key
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showKey ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Enter API Key to update"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        style={{ paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '10px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {showKey ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600 }}>Temperature</label>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6' }}>{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#3b82f6' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      0.0 recommended for deterministic code compilation and transformation.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 8192)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                    {saved && (
                      <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                        ✓ Settings saved & updated on server
                      </span>
                    )}
                    <button type="submit" className="btn-primary">
                      Save LLM Settings
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeSection === 'general' && (
              <div style={{ maxWidth: '560px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
                  General Interface Settings
                </h4>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Appearance Theme
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setTheme && setTheme('light')}
                      className={theme === 'light' ? 'btn-primary' : 'btn-outline'}
                      style={{ padding: '8px 16px', borderRadius: '6px' }}
                    >
                      ☀️ Light Theme
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme && setTheme('dark')}
                      className={theme === 'dark' ? 'btn-primary' : 'btn-outline'}
                      style={{ padding: '8px 16px', borderRadius: '6px' }}
                    >
                      🌙 Dark Theme
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Default Project Identifier
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    defaultValue="Legacy_Migration"
                    disabled
                  />
                </div>
              </div>
            )}

            {activeSection === 'agents' && (
              <div style={{ maxWidth: '640px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
                  6-Agent Pipeline Configuration
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                  All 6 agents execute autonomously in sequential synchronization:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: '1. Discovery Agent', desc: 'Scans AST, database queries, and session state', active: true },
                    { name: '2. Manager Agent', desc: 'Decomposes modules and creates task checklists', active: true },
                    { name: '3. Prompt Maker Agent', desc: 'Synthesizes cross-file context and user directives', active: true },
                    { name: '4. Execution Agent', desc: 'Generates target language code via Gemini 2.5', active: true },
                    { name: '5. Validator Agent', desc: '2-iteration feedback loop against requirements', active: true },
                    { name: '6. Finalizer Agent', desc: '3-attempt self-repair runtime compiler test suite', active: true }
                  ].map((ag, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{ag.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{ag.desc}</div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: '#ecfdf5', padding: '3px 8px', borderRadius: '12px' }}>
                        ACTIVE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div style={{ maxWidth: '560px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
                  Security & Execution Isolation
                </h4>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Code Validation Sandbox
                  </label>
                  <select
                    className="form-input"
                    value={sandboxMode}
                    onChange={(e) => setSandboxMode(e.target.value)}
                  >
                    <option value="docker">Docker Container Sandboxing (Isolated)</option>
                    <option value="subprocess">Local Subprocess PyCompile / Node Check</option>
                  </select>
                </div>

                <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>
                    ✓ Zip Slip Protection Enabled
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    All uploaded archive paths are strictly validated to prevent directory traversal and arbitrary file overwrite attacks.
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'advanced' && (
              <div style={{ maxWidth: '560px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
                  Advanced Pipeline Telemetry
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cache Engine:</span>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)' }}>SHA-256 Prompt Caching Layer</strong>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Max Upload Limit:</span>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)' }}>100 MB</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
