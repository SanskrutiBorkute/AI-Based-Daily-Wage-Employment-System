import React, { useState, useEffect } from 'react';
import { apiCall, apiUploadCall } from '../services/api';
import { LANG, TRADES, AVATAR_COLORS } from '../services/constants';

const Profile = ({ lang, role, onLogout, onNavigate }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [trade, setTrade] = useState('Plumber');
  const [experience, setExperience] = useState('3-5');
  const [locationName, setLocationName] = useState('');
  const [wage, setWage] = useState(500);
  const [availability, setAvailability] = useState('now');
  const [selectedLangs, setSelectedLangs] = useState(['Hindi']);
  const [avatarColor, setAvatarColor] = useState('#F05A1A');
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [wageRecommendation, setWageRecommendation] = useState(null);
  const [careerAdvice, setCareerAdvice] = useState(null);

  // Tabs / History states
  const [applications, setApplications] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [activeJobId, setActiveJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  const t = LANG[lang];
  const langOptions = ['Hindi', 'English', 'Marathi', 'Gujarati', 'Punjabi', 'Bhojpuri'];

  const fetchProfile = async () => {
    setLoading(true);
    try {
      if (role === 'worker') {
        const data = await apiCall('/workers/my-profile');
        setProfile(data);

        const wageData = await apiCall(
  '/ai/wage-recommendation',
  'POST',
  {
    trade: data.trade,
    locationName: data.locationName
  }
);

setWageRecommendation(wageData);
const adviceData = await apiCall('/ai/career-advice');
setCareerAdvice(adviceData);

        setName(data.name || '');
        setPhone(data.phone || '');
        setTrade(data.trade || 'Plumber');
        setExperience(data.experience || '3-5');
        setLocationName(data.locationName || '');
        setWage(data.wage || 500);
        setAvailability(data.availability || 'now');
        setSelectedLangs(data.languages || ['Hindi']);
        setAvatarColor(data.avatarColor || '#F05A1A');

        // Fetch applications
        const apps = await apiCall('/applications/my-applications');
        setApplications(apps);
      } else if (role === 'employer') {
        const data = await apiCall('/employers/my-profile');
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phone || '');
        setLocationName(data.locationName || '');

        // Fetch posted jobs
        const jobs = await apiCall('/jobs/my-jobs');
        setMyJobs(jobs);
      }
    } catch (err) {
      console.log('No profile found yet, please create one');
      setEditing(true); // Auto-open edit mode if profile is missing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [role]);

  const toggleLang = (l) => {
    if (selectedLangs.includes(l)) {
      setSelectedLangs(selectedLangs.filter(x => x !== l));
    } else {
      setSelectedLangs([...selectedLangs, l]);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (role === 'worker') {
        const body = {
          name, phone, trade, experience, locationName, wage, availability, languages: selectedLangs, avatarColor
        };
        const updated = await apiCall('/workers/profile', 'POST', body);
        setProfile(updated);
      } else if (role === 'employer') {
        const body = { name, phone, locationName };
        const updated = await apiCall('/employers/profile', 'POST', body);
        setProfile(updated);
      }
      setEditing(false);
      fetchProfile();
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await apiUploadCall('/workers/upload-avatar', formData);
      setProfile(prev => ({ ...prev, profileImage: res.imageUrl }));
      alert('Avatar uploaded successfully!');
    } catch (err) {
      alert(err.message || 'Upload failed. Make sure your profile is saved first.');
    } finally {
      setUploading(false);
    }
  };

  // View job applicants
  const handleViewApplicants = async (jobId) => {
    if (activeJobId === jobId) {
      setActiveJobId(null);
      setApplicants([]);
      return;
    }
    setActiveJobId(jobId);
    setApplicantsLoading(true);
    try {
      const data = await apiCall(`/applications/job-applicants/${jobId}`);
      setApplicants(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setApplicantsLoading(false);
    }
  };

  // Accept/Reject application
  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await apiCall(`/applications/${appId}`, 'PATCH', { status: newStatus });
      alert(`Application ${newStatus}!`);
      // Reload applicants
      if (activeJobId) {
        const data = await apiCall(`/applications/job-applicants/${activeJobId}`);
        setApplicants(data);
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };
  const handleRateWorker = async (appId) => {
  try {
    await apiCall(`/applications/${appId}/rate`, 'POST', {
      rating: 5,
      review: 'Excellent worker'
    });

    alert('Worker rated successfully!');

    if (activeJobId) {
      const data = await apiCall(`/applications/job-applicants/${activeJobId}`);
      setApplicants(data);
    }
  } catch (err) {
    alert(err.message || 'Rating failed');
  }
};

  if (loading && !profile && !editing) {
    return (
      <div className="screen active">
        <div className="topbar"><div className="topbar-title">{t.nav5}</div></div>
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
        <div className="topbar-title">{t.mpTitle}</div>
      </div>

      <div className="scroll-body">
        {/* Profile Card / edit form */}
        {!editing && profile ? (
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="profile-hero" style={{ backgroundColor: profile.avatarColor || 'var(--orange)' }}>
              <div 
                className="ph-avatar"
                style={{ 
                  backgroundImage: profile.profileImage ? `url(http://localhost:5000${profile.profileImage})` : 'none',
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }}
              >
                {!profile.profileImage && profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="ph-name">{profile.name}</div>
              <div className="ph-trade">
                {role === 'worker' ? (
                  lang === 'hi' 
                    ? (TRADES.find(tr => tr.name === profile.trade)?.hi || profile.trade) 
                    : lang === 'mr' 
                      ? (TRADES.find(tr => tr.name === profile.trade)?.mr || profile.trade) 
                      : profile.trade
                ) : (
                  'Employer'
                )}
              </div>
              <button className="lang-btn" onClick={() => setEditing(true)} style={{ background: '#fff', color: 'var(--orange)', border: 'none', margin: '8px auto 0' }}>
                ✏️ Edit Profile
              </button>
            </div>
            
            <div className="card-body">
              <div className="info-row">
                <span className="info-key">📞 Phone</span>
                <span className="info-val">{profile.phone}</span>
              </div>
              <div className="info-row">
                <span className="info-key">📍 Location</span>
                <span className="info-val">{profile.locationName}</span>
              </div>
              {role === 'worker' && (
                <>
                  <div className="info-row">
                    <span className="info-key">💰 Daily Wage</span>
                    <span className="info-val">₹{profile.wage} / day</span>
                  </div>

                  {wageRecommendation && (
  <div
    style={{
      background: '#F0F7FF',
      border: '2px solid #2196F3',
      borderRadius: '10px',
      padding: '12px',
      marginTop: '10px',
      marginBottom: '10px'
    }}
  >
    <div
      style={{
        fontWeight: '800',
        color: '#2196F3',
        marginBottom: '6px'
      }}
    >
      🤖 AI Wage Recommendation
    </div>

    <div>
      Recommended: ₹{wageRecommendation.recommendedWage}/day
    </div>

    <div style={{ fontSize: '13px' }}>
      Market Range: ₹{wageRecommendation.minWage} - ₹{wageRecommendation.maxWage}
    </div>

   <div
  style={{
    fontSize: '12px',
    color: '#555',
    marginTop: '6px'
  }}
>
  {wageRecommendation.reason}
</div>
</div>
)}

{careerAdvice && (
  <div
    style={{
      background: '#F5FFF5',
      border: '2px solid #4CAF50',
      borderRadius: '10px',
      padding: '12px',
      marginTop: '12px',
      marginBottom: '12px'
    }}
  >
    <div
      style={{
        fontWeight: '800',
        color: '#4CAF50',
        marginBottom: '8px'
      }}
    >
      🤖 AI Skill Recommendations
    </div>

    <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
      {careerAdvice.skills.map((skill, index) => (
        <li key={index}>{skill}</li>
      ))}
    </ul>

    <div style={{ fontSize: '13px', marginBottom: '8px' }}>
      {careerAdvice.advice}
    </div>

    <div
      style={{
        fontSize: '12px',
        fontWeight: '700',
        color: '#2E7D32'
      }}
    >
      🚀 Next Step: {careerAdvice.nextSteps}
    </div>
  </div>
)}

<div className="info-row">
  <span className="info-key">⭐ Rating</span>
  <span className="info-val">
    {profile.rating || 5.0}
    ({profile.totalRatings || 0} reviews)
  </span>
</div>

<div className="info-row">
  <span className="info-key">👷 Jobs Completed</span>
  <span className="info-val">
    {profile.jobsCount || 0}
  </span>
</div>
                  <div className="info-row">
                    <span className="info-key">📅 Experience</span>
                    <span className="info-val">{profile.experience} years</span>
                  </div>
                  <div className="info-row">
                    <span className="info-key">🟢 Availability</span>
                    <span className="info-val" style={{ textTransform: 'capitalize' }}>
                      {profile.availability === 'now' ? t.availNow : profile.availability === 'soon' ? t.availSoon : t.availBusy}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--orange)', marginBottom: '16px' }}>
              {profile ? 'Edit Profile details' : 'Complete your Profile'}
            </h3>
            
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label">{t.regLblName}</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.regLblPhone}</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.regLblArea}</label>
                <input
                  type="text"
                  className="form-input"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Nagpur"
                  required
                />
              </div>

              {role === 'worker' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t.regLblTrade}</label>
                    <select
                      className="form-select"
                      value={trade}
                      onChange={(e) => setTrade(e.target.value)}
                      required
                    >
                      {TRADES.map((tr) => (
                        <option key={tr.name} value={tr.name}>
                          {lang === 'hi' ? `${tr.icon} ${tr.hi}` : lang === 'mr' ? `${tr.icon} ${tr.mr}` : `${tr.icon} ${tr.name}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.regLblExp}</label>
                    <select
                      className="form-select"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                    >
                      <option value="0-1">0-1 {lang === 'hi' ? 'साल' : 'year'}</option>
                      <option value="1-3">1-3 {lang === 'hi' ? 'साल' : 'years'}</option>
                      <option value="3-5">3-5 {lang === 'hi' ? 'साल' : 'years'}</option>
                      <option value="5-10">5-10 {lang === 'hi' ? 'साल' : 'years'}</option>
                      <option value="10+">10+ {lang === 'hi' ? 'साल' : 'years'}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.regLblWage}</label>
                    <div className="wage-display">
                      <div className="wage-num">₹{wage}</div>
                      <div className="wage-per">/{lang === 'hi' ? 'दिन' : lang === 'mr' ? 'दिवस' : 'day'}</div>
                    </div>
                    <input
                      type="range"
                      min={200}
                      max={2500}
                      step={50}
                      value={wage}
                      onChange={(e) => setWage(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">🟢 Availability status</label>
                    <select
                      className="form-select"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      required
                    >
                      <option value="now">{t.availNow}</option>
                      <option value="soon">{t.availSoon}</option>
                      <option value="busy">{t.availBusy}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.regLblLang}</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {langOptions.map((l) => {
                        const isSelected = selectedLangs.includes(l);
                        return (
                          <button
                            type="button"
                            key={l}
                            className={`lang-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => toggleLang(l)}
                            style={{ color: isSelected ? '#fff' : 'var(--ink2)', borderColor: isSelected ? 'var(--orange)' : 'var(--border)', background: isSelected ? 'var(--orange)' : '#fff', padding: '6px 12px' }}
                          >
                            {l}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Avatar upload */}
                  <div className="form-group">
                    <label className="form-label">📸 Profile Photo</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload} 
                      disabled={uploading}
                      style={{ fontSize: '13px' }}
                    />
                    {uploading && <div style={{ fontSize: '11px', color: 'var(--orange)', marginTop: '4px' }}>Uploading photo...</div>}
                  </div>

                  {/* Avatar Colors selector */}
                  <div className="form-group">
                    <label className="form-label">🎨 Card Color theme</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {AVATAR_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setAvatarColor(c)}
                          style={{
                            background: c,
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: avatarColor === c ? '3px solid #000' : 'none',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                {profile && (
                  <button type="button" className="submit-btn" onClick={() => setEditing(false)} style={{ background: '#fff', border: '1.5px solid var(--border)', color: 'var(--ink3)', boxShadow: 'none' }}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="submit-btn" style={{ flex: 1 }}>
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        )}

        {/* WORKER APPLICATIONS HISTORY */}
        {role === 'worker' && applications.length > 0 && (
          <div>
            <div className="sec-lbl">Applied Jobs history</div>
            {applications.map((app) => {
              const statusPill = app.status === 'accepted' ? 'pill-green' : app.status === 'rejected' ? 'pill-red' : 'pill-orange';
              return (
                <div key={app._id} className="job-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="job-card-title">{app.jobId?.title}</div>
                    <span className={`pill ${statusPill}`} style={{ textTransform: 'capitalize' }}>
                      {app.status}
                    </span>
                  </div>
                  <div className="job-card-meta">
                    📍 {app.jobId?.locationName} | Offered: ₹{app.jobId?.wage}/day
                  </div>
                  {app.status === 'accepted' && (
                    <div style={{ background: 'var(--green-l)', padding: '10px', borderRadius: '8px', border: '1px solid var(--green)', marginTop: '8px', fontSize: '13px' }}>
                      📞 Call Employer to start work: <strong>{app.jobId?.phone}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* EMPLOYER POSTED JOBS & APPLICANTS LIST */}
        {role === 'employer' && myJobs.length > 0 && (
          <div>
            <div className="sec-lbl">My Posted Jobs ({myJobs.length})</div>
            {myJobs.map((job) => (
              <div key={job._id} className="card" style={{ marginBottom: '12px' }}>
                <div className="card-head" onClick={() => handleViewApplicants(job._id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📋 {job.title}</span>
                  <span style={{ fontSize: '12px', color: 'var(--orange)', textDecoration: 'underline' }}>
                    {activeJobId === job._id ? 'Close' : 'View Applicants'}
                  </span>
                </div>

                <div className="card-body">
                  <div style={{ fontSize: '13px', color: 'var(--ink2)', marginBottom: '8px' }}>
                    {job.description}
                  </div>
                  <div className="job-card-row">
                    <span className="pill pill-blue">🛠 {job.trade}</span>
                    <span className="pill pill-green">₹{job.wage}/day</span>
                    <span className="pill pill-orange">📍 {job.locationName}</span>
                  </div>

                  {/* Applicants expansion */}
                  {activeJobId === job._id && (
                    <div style={{ marginTop: '16px', borderTop: '1.5px solid var(--border)', paddingTop: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '10px' }}>Applicants list:</h4>
                      {applicantsLoading ? (
                        <div className="spinner"></div>
                      ) : applicants.length === 0 ? (
                        <div style={{ fontSize: '13px', color: 'var(--ink3)' }}>No workers applied for this job yet.</div>
                      ) : (
                        applicants.map(app => (
                          <div key={app._id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ fontWeight: '800', fontSize: '14px' }}>{app.workerId.name}</div>
                                <div
  style={{
    fontSize: '12px',
    color: '#FF9800',
    fontWeight: '700'
  }}
>
  ⭐ {app.workerId.rating || 5.0}
({app.workerId.totalRatings || 0} reviews)
</div>
                                <div style={{ fontSize: '12px', color: 'var(--orange)', fontWeight: '700' }}>{app.workerId.trade}</div>
                                <div style={{ fontSize: '11px', color: 'var(--ink3)' }}>Exp: {app.workerId.experience} yrs | Location: {app.workerId.locationName}</div>
                              </div>
                              <span className={`pill ${app.status === 'accepted' ? 'pill-green' : app.status === 'rejected' ? 'pill-red' : 'pill-orange'}`}>
                                {app.status}
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                              <a href={`tel:${app.workerId.phone}`} className="call-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                📞 Call
                              </a>
                              {app.status === 'applied' && (
                                <>
                                  <button onClick={() => handleUpdateStatus(app._id, 'accepted')} className="call-btn" style={{ background: 'var(--green)', padding: '6px 12px', fontSize: '12px' }}>
                                    ✓ Accept
                                  </button>
 
                                  <button onClick={() => handleUpdateStatus(app._id, 'rejected')} className="call-btn" style={{ background: 'var(--red)', padding: '6px 12px', fontSize: '12px' }}>
                                    ✗ Reject
                                  </button>
                                </>
                              )}
                              {app.status === 'accepted' && (
  <button
    onClick={() => handleUpdateStatus(app._id, 'completed')}
    className="call-btn"
    style={{
      background: '#2196F3',
      padding: '6px 12px',
      fontSize: '12px'
    }}
  >
    🏁 Complete Job
  </button>
)}

{app.status === 'completed' && (
  <button
    onClick={() => handleRateWorker(app._id)}
    className="call-btn"
    style={{
      background: '#FFD700',
      color: '#000',
      padding: '6px 12px',
      fontSize: '12px'
    }}
  >
    ⭐ Rate Worker
  </button>
)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="divider"></div>

        <button className="submit-btn" onClick={onLogout} style={{ background: 'var(--ink)', color: '#fff', boxShadow: 'none' }}>
          🔒 {t.logout}
        </button>
      </div>
    </div>
  );
};

export default Profile;
