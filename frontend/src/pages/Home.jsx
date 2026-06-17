import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { LANG } from '../services/constants';

const Home = ({ lang, setLang, role, onNavigate }) => {
  const [stats, setStats] = useState({ workers: 0, jobs: 0, rating: '4.8★' });
  const t = LANG[lang];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const workers = await apiCall('/workers');
        const jobs = await apiCall('/jobs');
        setStats({
          workers: workers.length,
          jobs: jobs.length,
          rating: '4.8★'
        });
      } catch (err) {
        console.error('Failed to load stats:', err.message);
      }
    };
    fetchStats();
  }, []);

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
        <div className="hero">
          <div className="hero-greeting">{t.greeting}</div>
          <div className="hero-title" dangerouslySetInnerHTML={{ __html: t.title }} />
          <div className="hero-sub">{t.sub}</div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">{stats.workers}</div>
              <div className="hero-stat-lbl">{t.stat1}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">{stats.jobs}</div>
              <div className="hero-stat-lbl">{t.stat2}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">{stats.rating}</div>
              <div className="hero-stat-lbl">{t.stat3}</div>
            </div>
          </div>
        </div>

        <div className="sec-lbl">{t.choose}</div>

        {role === 'admin' && (
          <button className="big-btn" onClick={() => onNavigate('admin-dashboard')} style={{ borderColor: 'var(--orange)', background: 'var(--orange-l)' }}>
            <div className="big-btn-icon" style={{ background: '#EDE9FE' }}>🔑</div>
            <div className="big-btn-text">
              <div className="big-btn-title" style={{ color: 'var(--orange)' }}>Admin Dashboard</div>
              <div className="big-btn-sub">Manage platform, users & moderate listings</div>
            </div>
            <div className="big-btn-arrow">›</div>
          </button>
        )}

        {role === 'employer' && (
          <>
            <button className="big-btn" onClick={() => onNavigate('find-workers')}>
              <div className="big-btn-icon" style={{ background: '#FEF0E8' }}>🔍</div>
              <div className="big-btn-text">
                <div className="big-btn-title">{t.btn1}</div>
                <div className="big-btn-sub">{t.btn1s}</div>
              </div>
              <div className="big-btn-arrow">›</div>
            </button>

            <button className="big-btn" onClick={() => onNavigate('post-job')}>
              <div className="big-btn-icon" style={{ background: '#DBEAFE' }}>📋</div>
              <div className="big-btn-text">
                <div className="big-btn-title">{t.btn3}</div>
                <div className="big-btn-sub">{t.btn3s}</div>
              </div>
              <div className="big-btn-arrow">›</div>
            </button>
          </>
        )}

        {role === 'worker' && (
          <>
            <button className="big-btn" onClick={() => onNavigate('find-jobs')}>
              <div className="big-btn-icon" style={{ background: '#DCFCE7' }}>💼</div>
              <div className="big-btn-text">
                <div className="big-btn-title">{lang === 'hi' ? 'काम खोजें' : lang === 'mr' ? 'काम शोधा' : 'Find a Job'}</div>
                <div className="big-btn-sub">{lang === 'hi' ? 'अपने आस-पास दैनिक मजदूरी काम खोजें' : lang === 'mr' ? 'तुमच्या जवळील काम शोधा' : 'Browse active job posts near you'}</div>
              </div>
              <div className="big-btn-arrow">›</div>
            </button>

            <button className="big-btn" onClick={() => onNavigate('profile')}>
              <div className="big-btn-icon" style={{ background: '#FEF0E8' }}>👷</div>
              <div className="big-btn-text">
                <div className="big-btn-title">{lang === 'hi' ? 'मेरा प्रोफाइल और हुनर' : lang === 'mr' ? 'माझे प्रोफाइल आणि कौशल्य' : 'My Profile & Skill'}</div>
                <div className="big-btn-sub">{lang === 'hi' ? 'अपनी मजदूरी, उपलब्धता और स्थान बदलें' : lang === 'mr' ? 'तुमची मजुरी आणि ठिकाण बदला' : 'Edit wage, experience and availability'}</div>
              </div>
              <div className="big-btn-arrow">›</div>
            </button>
          </>
        )}

        <button className="big-btn" onClick={() => onNavigate('ai-help')}>
          <div className="big-btn-icon" style={{ background: '#EDE9FE' }}>🤖</div>
          <div className="big-btn-text">
            <div className="big-btn-title">{t.btn4}</div>
            <div className="big-btn-sub">{t.btn4s}</div>
          </div>
          <div className="big-btn-arrow">›</div>
        </button>
      </div>
    </div>
  );
};

export default Home;
