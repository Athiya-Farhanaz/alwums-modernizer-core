import React from 'react';

export default function Dashboard({ onNavigate, projects = [] }) {
  const totalProjects = projects.length > 0 ? projects.length : 12;
  const completedProjects = projects.length > 0 ? projects.filter(p => p.status === 'completed').length : 8;
  const inProgressProjects = projects.length > 0 ? projects.filter(p => p.status === 'in-progress').length : 3;
  const successRate = totalProjects > 0 ? Math.min(100, Math.round((completedProjects / totalProjects) * 100)) : 92;

  const pipelineAgents = [
    {
      num: 1,
      name: 'Analyzer',
      sub: 'Code Analysis',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4f46e5" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <path d="M11 8v6M8 11h6"/>
        </svg>
      )
    },
    {
      num: 2,
      name: 'Planner',
      sub: 'Strategy Planning',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4f46e5" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    },
    {
      num: 3,
      name: 'Generator',
      sub: 'Code Generation',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4f46e5" strokeWidth="2">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      )
    },
    {
      num: 4,
      name: 'Tester',
      sub: 'Quality Testing',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4f46e5" strokeWidth="2">
          <path d="M10 2v7.31L4 18a2 2 0 0 0 1.66 3h12.68A2 2 0 0 0 20 18l-6-8.69V2"/>
          <path d="M8.5 2h7"/>
        </svg>
      )
    },
    {
      num: 5,
      name: 'Verifier',
      sub: 'Verification & Review',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4f46e5" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      )
    },
    {
      num: 6,
      name: 'Finalizer',
      sub: 'Packaging & Delivery',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4f46e5" strokeWidth="2">
          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      )
    }
  ];

  const recentActivities = [
    { name: 'HR_Portal', tech: 'Classic ASP', status: 'Completed', time: '2 mins ago', color: '#3b82f6' },
    { name: 'Inventory_System', tech: 'Classic ASP', status: 'In Progress', time: '15 mins ago', color: '#10b981' },
    { name: 'Old_CRM', tech: 'ASP', status: 'Completed', time: '1 hour ago', color: '#f59e0b' },
    { name: 'Billing_App', tech: 'Classic ASP', status: 'Failed', time: '3 hours ago', color: '#3b82f6' },
    { name: 'Legacy_Reports', tech: 'Classic ASP', status: 'Completed', time: '1 day ago', color: '#10b981' }
  ];

  return (
    <div className="page-view active-view" style={{ padding: '0 4px' }}>
      {/* 4 KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Total Projects */}
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#3b82f6" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Projects</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.15, margin: '2px 0' }}>
              {totalProjects}
            </div>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>+2 this week</span>
          </div>
        </div>

        {/* Completed */}
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Completed</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.15, margin: '2px 0' }}>
              {completedProjects}
            </div>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>66% of total</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>In Progress</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.15, margin: '2px 0' }}>
              {inProgressProjects}
            </div>
            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600 }}>25% of total</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#8b5cf6" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Success Rate</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.15, margin: '2px 0' }}>
              {successRate}%
            </div>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>+5% vs last week</span>
          </div>
        </div>
      </div>

      {/* Pipeline Overview Card */}
      <div className="card-panel" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Pipeline Overview
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            6-Agent Modernization Pipeline
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* Dashed Line Connecting Nodes */}
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '50px',
            right: '50px',
            borderTop: '2px dashed #6366f1',
            zIndex: 1
          }} />

          {pipelineAgents.map((ag) => (
            <div key={ag.num} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
              width: '120px',
              textAlign: 'center'
            }}>
              {/* Circular Icon Node */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                {ag.icon}
              </div>

              {/* Number Badge */}
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#3b82f6',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '6px'
              }}>
                {ag.num}
              </div>

              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                {ag.name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {ag.sub}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Layout: Time Saved & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px' }}>
        {/* Modernization Time Saved */}
        <div className="card-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                  Modernization Time Saved
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Compared to manual migration
                </p>
              </div>
              <span style={{
                background: '#ecfdf5',
                color: '#059669',
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '16px'
              }}>
                Time Saved <strong>84h 10m</strong>
              </span>
            </div>

            <div style={{ margin: '24px 0 16px 0' }}>
              <div style={{ fontSize: '54px', fontWeight: 800, color: '#3b82f6', lineHeight: 1 }}>
                78%
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Average time reduction achieved
              </p>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '78%', height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>78%</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Recent Activity
            </h3>
            <button
              onClick={() => onNavigate('projects')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3b82f6',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentActivities.map((act, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: i !== recentActivities.length - 1 ? '12px' : '0',
                borderBottom: i !== recentActivities.length - 1 ? '1px solid var(--border-color)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `${act.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={act.color} strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {act.name}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({act.tech})
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: act.status === 'Completed' ? '#ecfdf5' : act.status === 'In Progress' ? '#eff6ff' : '#fef2f2',
                    color: act.status === 'Completed' ? '#059669' : act.status === 'In Progress' ? '#2563eb' : '#dc2626'
                  }}>
                    {act.status}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '80px', textAlign: 'right' }}>
                    {act.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
