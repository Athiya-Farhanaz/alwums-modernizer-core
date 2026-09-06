import React, { useState } from 'react';

const DEFAULT_PROJECTS = [
  { name: 'HR_Portal', tech: 'Classic ASP', status: 'Completed', progress: 100, updated: '2 mins ago' },
  { name: 'Inventory_System', tech: 'Classic ASP', status: 'In Progress', progress: 65, updated: '15 mins ago' },
  { name: 'Old_CRM', tech: 'Classic ASP', status: 'Completed', progress: 100, updated: '1 hour ago' },
  { name: 'Billing_App', tech: 'Classic ASP', status: 'Failed', progress: 0, updated: '3 hours ago' },
  { name: 'Legacy_Reports', tech: 'Classic ASP', status: 'Completed', progress: 100, updated: '1 day ago' }
];

export default function ProjectsList({ projects = [], onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const combinedProjects = projects.length > 0
    ? projects.map(p => ({
        name: p.name,
        tech: p.tech || 'Classic ASP',
        status: p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1).replace('-', ' ') : 'Completed',
        progress: p.progress || 100,
        updated: p.updated || 'Just now'
      }))
    : DEFAULT_PROJECTS;

  const filtered = combinedProjects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.tech.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-view active-view">
      <div className="card-panel" style={{ padding: '24px' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
              Projects
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Manage and monitor all legacy modernization repositories
            </p>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('upload')}>
            + New Project
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px' }}
            />
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              style={{ position: 'absolute', left: '12px', top: '12px' }}
            >
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>

          <select
            className="form-input"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Datatable */}
        <div className="datatable-wrapper">
          <table className="datatable">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Technology</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((proj, idx) => {
                const statusColor = proj.status === 'Completed'
                  ? { bg: '#ecfdf5', text: '#059669' }
                  : proj.status === 'In Progress'
                  ? { bg: '#eff6ff', text: '#2563eb' }
                  : { bg: '#fef2f2', text: '#dc2626' };

                return (
                  <tr key={idx} style={{ cursor: 'pointer' }} onClick={() => onNavigate('pipeline')}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {proj.name}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {proj.tech}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: statusColor.bg,
                        color: statusColor.text
                      }}>
                        {proj.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '100px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${proj.progress}%`,
                            height: '100%',
                            background: proj.status === 'Failed' ? '#dc2626' : '#10b981',
                            borderRadius: '3px'
                          }} />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {proj.progress}%
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {proj.updated}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Showing 1 to {filtered.length} of {combinedProjects.length} projects
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="pagination-btn" disabled={currentPage === 1}>&lt;</button>
            <button className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
            <button className={`pagination-btn ${currentPage === 2 ? 'active' : ''}`} onClick={() => setCurrentPage(2)}>2</button>
            <button className={`pagination-btn ${currentPage === 3 ? 'active' : ''}`} onClick={() => setCurrentPage(3)}>3</button>
            <button className="pagination-btn">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
