import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';

const AdminDashboard = ({ lang, onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await apiCall('/admin/stats');
      setStats(statsRes);

      const usersRes = await apiCall('/admin/users');
      setUsers(usersRes);

      const jobsRes = await apiCall('/jobs');
      setJobs(jobsRes);
    } catch (err) {
      console.error('Failed to load admin stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their profile details/data?')) return;
    try {
      await apiCall(`/admin/users/${userId}`, 'DELETE');
      alert('User deleted successfully.');
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Deletion failed.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await apiCall(`/admin/jobs/${jobId}`, 'DELETE');
      alert('Job listing deleted successfully.');
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Deletion failed.');
    }
  };

  if (loading && !stats) {
    return (
      <div className="screen active">
        <div className="topbar">
          <button className="topbar-back" onClick={() => onNavigate('home')}>‹</button>
          <div className="topbar-title">Admin Dashboard</div>
        </div>
        <div className="scroll-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active">
      <div className="topbar">
        <button className="topbar-back" onClick={() => onNavigate('home')}>‹</button>
        <div className="topbar-title">🛡️ Admin Dashboard</div>
      </div>

      <div className="scroll-body">
        {/* Statistics Blocks */}
        <div className="sec-lbl">Platform Statistics</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          <div className="card" style={{ padding: '12px', background: 'var(--orange-l)', border: '1.5px solid var(--orange)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--orange)' }}>TOTAL USERS</div>
            <div style={{ fontSize: '24px', fontWeight: '900' }}>{stats?.totalUsers || 0}</div>
          </div>
          <div className="card" style={{ padding: '12px', background: 'var(--green-l)', border: '1.5px solid var(--green)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--green)' }}>WORKER PROFILES</div>
            <div style={{ fontSize: '24px', fontWeight: '900' }}>{stats?.totalWorkers || 0}</div>
          </div>
          <div className="card" style={{ padding: '12px', background: 'var(--blue-l)', border: '1.5px solid var(--blue)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--blue)' }}>EMPLOYERS</div>
            <div style={{ fontSize: '24px', fontWeight: '900' }}>{stats?.totalEmployers || 0}</div>
          </div>
          <div className="card" style={{ padding: '12px', background: 'var(--gold-l)', border: '1.5px solid var(--gold)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gold)' }}>JOB POSTINGS</div>
            <div style={{ fontSize: '24px', fontWeight: '900' }}>{stats?.totalJobs || 0}</div>
          </div>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`lang-btn ${activeTab === 'users' ? 'active' : ''}`}
            style={{ flex: 1, padding: '10px', fontSize: '13px', background: activeTab === 'users' ? 'var(--orange)' : '#fff', color: activeTab === 'users' ? '#fff' : 'var(--ink2)', borderColor: 'var(--border)' }}
          >
            👤 Manage Users ({users.length})
          </button>
          <button 
            onClick={() => setActiveTab('jobs')} 
            className={`lang-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            style={{ flex: 1, padding: '10px', fontSize: '13px', background: activeTab === 'jobs' ? 'var(--orange)' : '#fff', color: activeTab === 'jobs' ? '#fff' : 'var(--ink2)', borderColor: 'var(--border)' }}
          >
            📋 Manage Jobs ({jobs.length})
          </button>
        </div>

        {/* User list */}
        {activeTab === 'users' && (
          <div>
            <div className="sec-lbl">User Accounts</div>
            {users.map((user) => (
              <div key={user._id} className="card" style={{ padding: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '15px' }}>📞 {user.phone}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>
                      Role: <span className="pill pill-blue" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteUser(user._id)} 
                    className="call-btn" 
                    style={{ background: 'var(--red)', padding: '6px 12px', fontSize: '12px' }}
                  >
                    Delete User
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job list */}
        {activeTab === 'jobs' && (
          <div>
            <div className="sec-lbl">Active Job Postings</div>
            {jobs.map((job) => (
              <div key={job._id} className="card" style={{ padding: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, marginRight: '10px' }}>
                    <div style={{ fontWeight: '800', fontSize: '15px' }}>📋 {job.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--orange)', fontWeight: '700' }}>Trade: {job.trade}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>📍 {job.locationName} | ₹{job.wage}/day</div>
                  </div>
                  <button 
                    onClick={() => handleDeleteJob(job._id)} 
                    className="call-btn" 
                    style={{ background: 'var(--red)', padding: '6px 12px', fontSize: '12px', flexShrink: 0 }}
                  >
                    Remove Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
