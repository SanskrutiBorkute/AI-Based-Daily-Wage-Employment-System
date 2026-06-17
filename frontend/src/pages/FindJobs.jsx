import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { LANG, TRADES } from '../services/constants';

const FindJobs = ({ lang, onNavigate }) => {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [search, setSearch] = useState('');

  const t = LANG[lang];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let endpoint = '/jobs?';
      if (selectedTrade) endpoint += `trade=${selectedTrade}&`;
      if (search) endpoint += `search=${search}&`;

      const data = await apiCall(endpoint);
      setJobs(data);

      // Load my current applications to show "Applied" state
      const myApps = await apiCall('/applications/my-applications');
      const appJobIds = myApps.map(app => app.jobId?._id);
      setAppliedJobIds(appJobIds);
    } catch (err) {
      console.error('Failed to fetch jobs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedTrade, search]);

  const handleApply = async (jobId) => {
    try {
      await apiCall('/applications/apply', 'POST', { jobId });
      setAppliedJobIds([...appliedJobIds, jobId]);
      alert(lang === 'hi' ? 'आवेदन सफलतापूर्वक भेजा गया!' : lang === 'mr' ? 'अर्ज यशस्वीरित्या पाठवला!' : 'Applied successfully!');
    } catch (err) {
      alert(err.message || 'Failed to apply');
    }
  };

  return (
    <div className="screen active">
      <div className="topbar">
        <button className="topbar-back" onClick={() => onNavigate('home')}>‹</button>
        <div className="topbar-title">{lang === 'hi' ? 'नौकरी खोजें' : lang === 'mr' ? 'काम शोधा' : 'Marketplace'}</div>
      </div>

      <div className="scroll-body">
        {/* Search */}
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <input
            type="text"
            className="form-input"
            placeholder={lang === 'hi' ? '🔍 जगह या काम से खोजें...' : lang === 'mr' ? '🔍 जागा किंवा कामावरून शोधा...' : '🔍 Search by job title or location...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Trade Filter */}
        <div className="sec-lbl" style={{ marginBottom: '8px' }}>{t.regLblTrade}</div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }}>
          <button
            className={`trade-chip ${selectedTrade === '' ? 'selected' : ''}`}
            onClick={() => setSelectedTrade('')}
            style={{ whiteSpace: 'nowrap', padding: '8px 14px' }}
          >
            🌟 All
          </button>
          {TRADES.map((trade) => {
            const label = lang === 'hi' ? trade.hi : lang === 'mr' ? trade.mr : trade.name;
            return (
              <button
                key={trade.name}
                className={`trade-chip ${selectedTrade === trade.name ? 'selected' : ''}`}
                onClick={() => setSelectedTrade(trade.name)}
                style={{ whiteSpace: 'nowrap', padding: '8px 14px' }}
              >
                <span className="trade-chip-icon">{trade.icon}</span>
                {label}
              </button>
            );
          })}
        </div>

        {/* Jobs results */}
        <div className="sec-lbl">{lang === 'hi' ? 'सक्रिय नौकरियां' : lang === 'mr' ? 'सक्रिय कामे' : 'Active Jobs Near You'}</div>
        {loading ? (
          <div className="spinner" style={{ marginTop: '20px' }}></div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <div className="empty-title">
              {lang === 'hi' ? 'कोई नौकरी नहीं मिली' : lang === 'mr' ? 'कोणतेही काम सापडले नाही' : 'No Jobs Found'}
            </div>
            <div className="empty-sub">
              {lang === 'hi' ? 'अलग हुनर चुनकर फिर से प्रयास करें।' : lang === 'mr' ? 'दुसरे कौशल्य निवडून पुन्हा प्रयत्न करा.' : 'Try changing your filter settings.'}
            </div>
          </div>
        ) : (
          jobs.map((job) => {
            const hasApplied = appliedJobIds.includes(job._id);
            return (
              <div key={job._id} className="card" style={{ border: job.urgent ? '2px solid var(--red)' : '1.5px solid var(--border)' }}>
                <div className="card-head" style={{ justifyContent: 'space-between', display: 'flex' }}>
                  <span>📋 {job.title}</span>
                  {job.urgent && <span className="pill pill-red">⚠️ URGENT</span>}
                </div>
                
                <div className="card-body">
                  <p style={{ fontSize: '13px', color: 'var(--ink2)', marginBottom: '10px', lineHeight: '1.4' }}>
                    {job.description}
                  </p>
                  
                  <div className="info-row" style={{ padding: '4px 0', borderBottom: 'none' }}>
                    <span className="info-key">💰 Offered Wage</span>
                    <span className="info-val" style={{ color: 'var(--green)' }}>₹{job.wage} / day</span>
                  </div>
                  <div className="info-row" style={{ padding: '4px 0', borderBottom: 'none' }}>
                    <span className="info-key">📍 Location</span>
                    <span className="info-val">{job.locationName}</span>
                  </div>
                  <div className="info-row" style={{ padding: '4px 0', borderBottom: 'none' }}>
                    <span className="info-key">🛠 Skills Required</span>
                    <span className="info-val" style={{ color: 'var(--orange)' }}>
                    <div
  className="info-row"
  style={{
    padding: '4px 0',
    borderBottom: 'none'
  }}
>
  <span className="info-key">🎯 Match Score</span>
  <span
    className="info-val"
    style={{
      color:
        job.matchScore >= 80
          ? 'green'
          : job.matchScore >= 50
          ? 'orange'
          : 'red',
      fontWeight: 'bold'
    }}
  >
    {job.matchScore || 0}%
  </span>
</div>
                      {lang === 'hi' 
                        ? (TRADES.find(tr => tr.name === job.trade)?.hi || job.trade) 
                        : lang === 'mr' 
                          ? (TRADES.find(tr => tr.name === job.trade)?.mr || job.trade) 
                          : job.trade
                      }
                    </span>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <button
                      className="submit-btn"
                      onClick={() => handleApply(job._id)}
                      disabled={hasApplied}
                      style={{
                        background: hasApplied ? 'var(--green)' : 'var(--orange)',
                        boxShadow: 'none',
                        padding: '12px',
                        fontSize: '15px'
                      }}
                    >
                      {hasApplied ? `✓ ${t.appliedBtn}` : t.applyBtn}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FindJobs;
