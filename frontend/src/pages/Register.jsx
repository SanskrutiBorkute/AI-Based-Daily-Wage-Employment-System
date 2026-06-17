import React, { useState } from 'react';
import { apiCall } from '../services/api';
import { LANG } from '../services/constants';

const Register = ({ lang, setLang, onRegisterSuccess, onGoToLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('worker');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = LANG[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password || !role) {
      setError(lang === 'hi' ? 'सभी जानकारी भरें' : lang === 'mr' ? 'सर्व माहिती भरा' : 'Please fill in all fields');
      return;
    }
    if (phone.length !== 10) {
      setError(lang === 'hi' ? '10 अंकों का नंबर दें' : lang === 'mr' ? '10 अंकी नंबर द्या' : 'Mobile number must be 10 digits');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await apiCall('/auth/register', 'POST', { phone, password, role });
      localStorage.setItem('ks_token', data.token);
      localStorage.setItem('ks_role', data.role);
      onRegisterSuccess(data);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen active">
      <div className="topbar">
        <div className="topbar-title">🔨 KaamSetu</div>
        <div className="topbar-lang">
          {['en', 'hi', 'mr'].map((l) => (
            <button
              key={l}
              className={`lang-btn ${l === lang ? 'active' : ''}`}
              onClick={() => setLang(l)}
            >
              {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'म'}
            </button>
          ))}
        </div>
      </div>
      <div className="scroll-body">
        <div className="card" style={{ marginTop: '20px', padding: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--orange)', marginBottom: '20px', textAlign: 'center' }}>
            {t.signup}
          </h2>
          {error && (
            <div style={{ color: 'var(--red)', background: 'var(--red-l)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontWeight: '700', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t.phone}</label>
              <input
                type="tel"
                className="form-input"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t.password}</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t.role}</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="worker">{t.worker}</option>
                <option value="employer">{t.employer}</option>
                <option value="admin">{t.admin}</option>
              </select>
            </div>
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? '...' : t.signup}
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>
            {t.haveAccount}{' '}
            <span style={{ color: 'var(--orange)', cursor: 'pointer', textDecoration: 'underline' }} onClick={onGoToLogin}>
              {t.login}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
