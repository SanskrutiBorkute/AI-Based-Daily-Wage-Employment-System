import React, { useState } from 'react';
import { apiCall } from '../services/api';
import { LANG } from '../services/constants';

const Login = ({ lang, setLang, onLoginSuccess, onGoToRegister }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = LANG[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setError(lang === 'hi' ? 'सभी जानकारी भरें' : lang === 'mr' ? 'सर्व माहिती भरा' : 'Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await apiCall('/auth/login', 'POST', { phone, password });
      localStorage.setItem('ks_token', data.token);
      localStorage.setItem('ks_role', data.role);
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
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
            {t.login}
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
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? '...' : t.login}
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>
            {t.noAccount}{' '}
            <span style={{ color: 'var(--orange)', cursor: 'pointer', textDecoration: 'underline' }} onClick={onGoToRegister}>
              {t.signup}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
