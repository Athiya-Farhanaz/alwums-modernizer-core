import React, { useState } from 'react';

export default function LogsView({ logs = [] }) {
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const defaultLogs = [
    { time: '14:23:57', agent: 'Finalizer Agent', level: 'success', message: 'Docker sandbox & subprocess compilation test suite armed.' },
    { time: '14:23:57', agent: 'Validator Agent', level: 'info', message: 'Autonomous syntax and task-completion validator synchronized.' },
    { time: '14:23:57', agent: 'Execution Agent', level: 'info', message: 'Gemini 2.5 Flash code transformation engine ready.' },
    { time: '14:23:57', agent: 'Prompt Maker Agent', level: 'info', message: 'Cross-file context synthesizer and prompt maker online.' },
    { time: '14:23:57', agent: 'Manager Agent', level: 'info', message: 'Task dependency planner & checklist orchestrator ready.' },
    { time: '14:23:57', agent: 'Discovery Agent', level: 'info', message: 'AST analyzer & framework signature scanner initialized.' }
  ];

  const sourceLogs = logs.length > 0 ? logs : defaultLogs;

  const filteredLogs = sourceLogs.filter(log => {
    const matchAgent = filterAgent === 'all' || log.agent.toLowerCase().includes(filterAgent.toLowerCase());
    const matchLevel = filterLevel === 'all' || log.level.toLowerCase() === filterLevel.toLowerCase();
    const matchSearch = !searchTerm || (log.message && log.message.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchDate = !dateFilter || (log.created_at && log.created_at.startsWith(dateFilter));
    return matchAgent && matchLevel && matchSearch && matchDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const displayedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  const getLevelStyle = (level) => {
    const l = (level || 'info').toLowerCase();
    if (l === 'error') return { bg: '#fef2f2', text: '#dc2626' };
    if (l === 'warning') return { bg: '#fffbeb', text: '#d97706' };
    if (l === 'success') return { bg: '#ecfdf5', text: '#059669' };
    return { bg: '#eff6ff', text: '#2563eb' };
  };

  return (
    <div className="page-view active-view">
      <div className="card-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
          Multi-Agent System Telemetry Logs
        </h3>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <select
            className="form-input"
            style={{ width: '190px' }}
            value={filterAgent}
            onChange={(e) => { setFilterAgent(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Agents</option>
            <option value="Discovery Agent">Discovery Agent</option>
            <option value="Manager Agent">Manager Agent</option>
            <option value="Prompt Maker Agent">Prompt Maker Agent</option>
            <option value="Execution Agent">Execution Agent</option>
            <option value="Validator Agent">Validator Agent</option>
            <option value="Finalizer Agent">Finalizer Agent</option>
          </select>

          <select
            className="form-input"
            style={{ width: '140px' }}
            value={filterLevel}
            onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Levels</option>
            <option value="info">INFO</option>
            <option value="success">SUCCESS</option>
            <option value="warning">WARNING</option>
            <option value="error">ERROR</option>
          </select>

          <input
            type="date"
            className="form-input"
            style={{ width: '160px' }}
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            title="Filter by date"
          />

          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search logs by keyword..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', paddingLeft: '34px' }}
            />
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              style={{ position: 'absolute', left: '12px', top: '12px' }}
            >
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
        </div>

        {/* Datatable */}
        <div className="datatable-wrapper">
          <table className="datatable">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>Time</th>
                <th style={{ width: '170px' }}>Agent</th>
                <th style={{ width: '110px' }}>Level</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No matching log entries found.
                  </td>
                </tr>
              ) : (
                displayedLogs.map((log, i) => {
                  const style = getLevelStyle(log.level);
                  return (
                    <tr key={i}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {log.time || '14:23:57'}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.agent}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: style.bg,
                          color: style.text
                        }}>
                          {(log.level || 'info').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                        {log.message}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Showing {filteredLogs.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, filteredLogs.length)} of {filteredLogs.length} logs
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className="pagination-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
