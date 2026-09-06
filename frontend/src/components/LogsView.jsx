import React, { useState } from 'react';

export default function LogsView({ logs }) {
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchAgent = filterAgent === 'all' || log.agent.toLowerCase() === filterAgent.toLowerCase();
    const matchLevel = filterLevel === 'all' || log.level.toLowerCase() === filterLevel.toLowerCase();
    const matchSearch = !searchTerm || log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchAgent && matchLevel && matchSearch;
  });

  return (
    <div className="page-view active-view">
      <div className="card-panel">
        <div className="filter-actions-bar">
          <select
            className="form-input filter-dropdown"
            style={{ width: '200px' }}
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
          >
            <option value="all">All Agents (6)</option>
            <option value="Discovery Agent">Discovery Agent</option>
            <option value="Manager Agent">Manager Agent</option>
            <option value="Prompt Maker Agent">Prompt Maker Agent</option>
            <option value="Execution Agent">Execution Agent</option>
            <option value="Validator Agent">Validator Agent</option>
            <option value="Finalizer Agent">Finalizer Agent</option>
          </select>

          <select
            className="form-input filter-dropdown"
            style={{ width: '150px' }}
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="info">INFO</option>
            <option value="success">SUCCESS</option>
            <option value="warning">WARNING</option>
            <option value="error">ERROR</option>
          </select>

          <div className="search-input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="Search MongoDB logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="datatable-wrapper">
          <table className="datatable">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Timestamp</th>
                <th style={{ width: '180px' }}>AI Agent</th>
                <th style={{ width: '110px' }}>Status</th>
                <th>Event Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No matching log entries found in MongoDB.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{log.time || '12:00:00'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{log.agent}</td>
                    <td>
                      <span className={`status-pill status-${log.level === 'error' ? 'failed' : log.level === 'warning' ? 'in-progress' : 'completed'}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px' }}>{log.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
