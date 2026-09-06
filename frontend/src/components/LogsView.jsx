import React, { useState } from 'react';

export default function LogsView({ logs = [] }) {
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [dateFilter, setDateFilter] = useState('2025-05-12');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const defaultLogs = [
    { time: '10:31:15', agent: 'Execution Agent', level: 'info', message: 'Generated modernized routes.py successfully' },
    { time: '10:31:10', agent: 'Execution Agent', level: 'info', message: 'Generating templates/products.html ...' },
    { time: '10:30:58', agent: 'Prompt Maker Agent', level: 'info', message: 'Context-aware prompt synthesized for products.asp' },
    { time: '10:30:46', agent: 'Manager Agent', level: 'info', message: 'Task checklist and dependency graph built successfully' },
    { time: '10:30:45', agent: 'Discovery Agent', level: 'info', message: 'Legacy discovery scan completed. 142 files correlated' },
    { time: '10:30:12', agent: 'Discovery Agent', level: 'info', message: 'Starting legacy AST codebase analysis...' }
  ];

  const sourceLogs = logs.length > 0 ? logs : defaultLogs;

  const filteredLogs = sourceLogs.filter(log => {
    const matchAgent = filterAgent === 'all' || log.agent.toLowerCase().includes(filterAgent.toLowerCase());
    const matchLevel = filterLevel === 'all' || log.level.toLowerCase() === filterLevel.toLowerCase();
    const matchSearch = !searchTerm || log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchAgent && matchLevel && matchSearch;
  });

  return (
    <div className="page-view active-view">
      <div className="card-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
          Logs
        </h3>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <select
            className="form-input"
            style={{ width: '190px' }}
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
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
            onChange={(e) => setFilterLevel(e.target.value)}
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
            onChange={(e) => setDateFilter(e.target.value)}
          />

          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <th style={{ width: '150px' }}>Agent</th>
                <th style={{ width: '100px' }}>Level</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No matching log entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {log.time || '10:30:12'}
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
                        background: log.level === 'error' ? '#fef2f2' : log.level === 'warning' ? '#fffbeb' : '#eff6ff',
                        color: log.level === 'error' ? '#dc2626' : log.level === 'warning' ? '#d97706' : '#2563eb'
                      }}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {log.message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Showing 1 to {filteredLogs.length} of 156 logs
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="pagination-btn" disabled={currentPage === 1}>&lt;</button>
            <button className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
            <button className={`pagination-btn ${currentPage === 2 ? 'active' : ''}`} onClick={() => setCurrentPage(2)}>2</button>
            <button className={`pagination-btn ${currentPage === 3 ? 'active' : ''}`} onClick={() => setCurrentPage(3)}>3</button>
            <span style={{ padding: '0 6px', color: 'var(--text-muted)' }}>...</span>
            <button className="pagination-btn" onClick={() => setCurrentPage(26)}>26</button>
            <button className="pagination-btn">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
