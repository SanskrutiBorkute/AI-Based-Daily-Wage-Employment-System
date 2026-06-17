import React, { useState } from 'react';
import { apiCall } from '../services/api';
import { LANG, TRADES } from '../services/constants';
import VoiceInput from '../components/VoiceInput';

const PostJob = ({ lang, onNavigate }) => {
  const [title, setTitle] = useState('');
  const [trade, setTrade] = useState('Plumber');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [wage, setWage] = useState(600);
  const [phone, setPhone] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // AI recommendation state
  const [aiRec, setAiRec] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const t = LANG[lang];

  const handleAiRecommend = async () => {
    if (!trade || !locationName) {
      alert(lang === 'hi' ? 'कृपया पहले हुनर और स्थान दर्ज करें।' : lang === 'mr' ? 'कृपया प्रथम कौशल्य आणि जागा प्रविष्ट करा.' : 'Please enter Trade and Location first.');
      return;
    }
    setAiLoading(true);
    setAiRec(null);
    try {
      const res = await apiCall('/ai/wage-recommendation', 'POST', { trade, locationName });
      setAiRec(res);
      setWage(res.recommendedWage);
    } catch (err) {
      console.error(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleVoiceTranscript = (text) => {
    setDescription(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiCall('/jobs', 'POST', {
        title,
        trade,
        description,
        locationName,
        wage,
        phone,
        urgent
      });
      setSuccess(true);
      setTimeout(() => {
        onNavigate('home');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="screen active">
        <div className="scroll-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--green)', textAlign: 'center' }}>
            {lang === 'hi' ? 'काम सफलतापूर्वक पोस्ट किया गया!' : lang === 'mr' ? 'काम यशस्वीरित्या पोस्ट केले!' : 'Job Posted Successfully!'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active">
      <div className="topbar">
        <button className="topbar-back" onClick={() => onNavigate('home')}>‹</button>
        <div className="topbar-title">{t.pjTitle}</div>
      </div>

      <div className="scroll-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t.pjLblTitle}</label>
            <input
              type="text"
              className="form-input"
              placeholder={lang === 'hi' ? 'उदा. नल सुधारना' : lang === 'mr' ? 'उदा. नळ दुरुस्ती' : 'e.g. Repair Leak in Pipe'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.pjLblTrade}</label>
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
            <label className="form-label">{t.pjLblDesc}</label>
            <VoiceInput
              lang={lang}
              onTranscript={handleVoiceTranscript}
              labelSpeak={t.voiceSpeak}
              labelListening={t.voiceListening}
            />
            <textarea
              className="form-input"
              style={{ minHeight: '100px', resize: 'none' }}
              placeholder={lang === 'hi' ? 'काम के बारे में बताएं...' : lang === 'mr' ? 'कामाचे वर्णन लिहा...' : 'Describe the work here...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.pjLblLoc}</label>
            <input
              type="text"
              className="form-input"
              placeholder={lang === 'hi' ? 'उदा. नागपुर' : lang === 'mr' ? 'उदा. नागपूर' : 'e.g. Nagpur'}
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>{t.pjLblWage}</label>
              <button
                type="button"
                onClick={handleAiRecommend}
                className="lang-btn"
                style={{ borderColor: 'var(--blue)', color: 'var(--blue)', fontWeight: '800' }}
                disabled={aiLoading}
              >
                {aiLoading ? '💡 Analyzing...' : '💡 AI Estimate'}
              </button>
            </div>

            {aiRec && (
              <div style={{ background: 'var(--blue-l)', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', border: '1px solid var(--blue)', color: 'var(--blue)', marginBottom: '12px' }}>
                <strong>AI recommendation:</strong> ₹{aiRec.recommendedWage}/day (Range: ₹{aiRec.minWage} - ₹{aiRec.maxWage})
                <div style={{ fontSize: '11px', marginTop: '3px', opacity: 0.85 }}>{aiRec.reason}</div>
              </div>
            )}

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
            <label className="form-label">{t.pjLblPhone}</label>
            <input
              type="tel"
              className="form-input"
              placeholder="9876543210"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <input
              type="checkbox"
              id="urgent"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--orange)' }}
            />
            <label htmlFor="urgent" style={{ fontSize: '15px', fontWeight: '800', cursor: 'pointer', color: 'var(--ink)' }}>
              ⚠️ {t.pjLblUrgent}
            </label>
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? 'Posting...' : '🚀 Post Job Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
