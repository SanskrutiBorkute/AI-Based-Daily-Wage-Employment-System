import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { LANG, TRADES } from '../services/constants';

const WorkerDetail = ({ lang, workerId, onBack }) => {
  const [worker, setWorker] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const t = LANG[lang];

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await apiCall(`/workers/${workerId}`);
        setWorker(data);

        // If employer is viewing, load their jobs to test AI matching
        const role = localStorage.getItem('ks_role');
        if (role === 'employer') {
          const jobs = await apiCall('/jobs/my-jobs');
          setMyJobs(jobs);
          if (jobs.length > 0) {
            setSelectedJobId(jobs[0]._id);
          }
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [workerId]);

  const calculateMatch = async () => {
    if (!selectedJobId) return;
    setMatchingLoading(true);
    setMatchResult(null);
    try {
      const res = await apiCall('/ai/job-matching', 'POST', {
        workerId: worker._id,
        jobId: selectedJobId
      });
      setMatchResult(res);
    } catch (err) {
      console.error(err.message);
    } finally {
      setMatchingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="screen active">
        <div className="topbar">
          <button className="topbar-back" onClick={onBack}>‹</button>
          <div className="topbar-title">{lang === 'hi' ? 'विवरण' : lang === 'mr' ? 'तपशील' : 'Details'}</div>
        </div>
        <div className="scroll-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="screen active">
        <div className="topbar">
          <button className="topbar-back" onClick={onBack}>‹</button>
          <div className="topbar-title">Error</div>
        </div>
        <div className="scroll-body">
          <div className="empty-state">
            <div className="empty-title">Worker profile not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active">
      <div className="topbar">
        <button className="topbar-back" onClick={onBack}>‹</button>
        <div className="topbar-title">{worker.name}</div>
      </div>

      <div className="scroll-body">
        {/* Profile Hero banner */}
        <div className="card" style={{ overflow: 'hidden', marginBottom: '16px' }}>
          <div className="profile-hero" style={{ backgroundColor: worker.avatarColor || 'var(--orange)' }}>
            <div 
              className="ph-avatar"
              style={{ 
                backgroundImage: worker.profileImage ? `url(http://localhost:5000${worker.profileImage})` : 'none',
                backgroundColor: 'rgba(255,255,255,0.2)'
              }}
            >
              {!worker.profileImage && worker.name.charAt(0).toUpperCase()}
            </div>
            <div className="ph-name">{worker.name}</div>
            <div className="ph-trade">
              {lang === 'hi' 
                ? (TRADES.find(tr => tr.name === worker.trade)?.hi || worker.trade) 
                : lang === 'mr' 
                  ? (TRADES.find(tr => tr.name === worker.trade)?.mr || worker.trade) 
                  : worker.trade
              }
            </div>
            <div className="ph-badges">
              <span className="ph-badge">⭐ 4.8 Rating</span>
              <span className="ph-badge">👷 {worker.jobsCount || 0} Jobs Completed</span>
            </div>
          </div>

          <div className="card-body">
            <div className="info-row">
              <span className="info-key">{t.regLblExp}</span>
              <span className="info-val">{worker.experience} {lang === 'hi' ? 'साल' : lang === 'mr' ? 'वर्षे' : 'Years'}</span>
            </div>
            <div className="info-row">
              <span className="info-key">{t.regLblWage}</span>
              <span className="info-val" style={{ color: 'var(--green)' }}>₹{worker.wage} / {lang === 'hi' ? 'दिन' : lang === 'mr' ? 'दिवस' : 'day'}</span>
            </div>
            <div className="info-row">
              <span className="info-key">{t.regLblArea}</span>
              <span className="info-val">📍 {worker.locationName}</span>
            </div>
            <div className="info-row">
              <span className="info-key">{t.regLblLang}</span>
              <span className="info-val">{worker.languages.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <a href={`tel:${worker.phone}`} className="submit-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          <span>📞</span> {t.callBtn} ({worker.phone})
        </a>

        {/* AI Job Suitability Matcher (For Employers) */}
        {myJobs.length > 0 && (
          <div className="card" style={{ border: '2px solid var(--blue)', background: '#F0F7FF', padding: '16px' }}>
            <h3 style={{ color: 'var(--blue)', fontSize: '16px', fontWeight: '900', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🤖 AI Suitability Match Score
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--ink2)', marginBottom: '12px' }}>
              {lang === 'hi' 
                ? 'यह जांचें कि यह कामगार आपके पोस्ट किए गए काम के लिए कितना उपयुक्त है।' 
                : lang === 'mr' 
                  ? 'हा कामगार तुमच्या कामासाठी किती योग्य आहे ते तपासा.' 
                  : 'Calculate how suitable this worker is for one of your posted jobs.'}
            </p>
            
            <div className="form-group">
              <select 
                className="form-select"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                style={{ background: '#fff' }}
              >
                {myJobs.map(job => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
            </div>

            <button 
              className="submit-btn" 
              onClick={calculateMatch} 
              disabled={matchingLoading}
              style={{ background: 'var(--blue)', boxShadow: 'none', padding: '12px', fontSize: '15px' }}
            >
              {matchingLoading ? 'Analyzing...' : 'Calculate Score'}
            </button>

            {matchResult && (
              <div style={{ marginTop: '16px', background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ 
                    fontSize: '22px', 
                    fontWeight: '900', 
                    color: matchResult.score >= 80 ? 'var(--green)' : matchResult.score >= 50 ? 'var(--gold)' : 'var(--red)',
                    background: matchResult.score >= 80 ? 'var(--green-l)' : matchResult.score >= 50 ? 'var(--gold-l)' : 'var(--red-l)',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    justifyContent: 'center'
                  }}>
                    {matchResult.score}%
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '14px' }}>
                      {matchResult.score >= 80 ? 'Excellent Match!' : matchResult.score >= 50 ? 'Good Potential' : 'Not Recommended'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>AI Recruitment Recommendation</div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--ink2)', marginBottom: '8px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                  "{matchResult.feedback}"
                </div>

                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink2)', marginBottom: '4px' }}>Reasons:</div>
                <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--ink3)' }}>
                  {matchResult.reasons.map((reason, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDetail;
