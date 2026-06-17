import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import FindWorkers from './pages/FindWorkers';
import WorkerDetail from './pages/WorkerDetail';
import FindJobs from './pages/FindJobs';
import PostJob from './pages/PostJob';
import AIHelper from './pages/AIHelper';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotificationsList from './pages/NotificationsList';
import { apiCall } from './services/api';
import { LANG } from './services/constants';

function App() {
  const [lang, setLang] = useState('en');
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check login session on mount
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('ks_token');
      const role = localStorage.getItem('ks_role');
      if (token && role) {
        try {
          const userData = await apiCall('/auth/me');
          setUser({ ...userData, token });
          setScreen('home');
        } catch (err) {
          console.error('Session expired, logging out:', err.message);
          handleLogout();
        }
      } else {
        setScreen('login');
      }
    };
    verifySession();
  }, []);

  // Poll for notifications unread count if logged in
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const notifs = await apiCall('/notifications');
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLoginSuccess = (loginData) => {
    setUser(loginData);
    setScreen('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('ks_token');
    localStorage.removeItem('ks_role');
    setUser(null);
    setScreen('login');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return (
          <Login
            lang={lang}
            setLang={setLang}
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => setScreen('register')}
          />
        );
      case 'register':
        return (
          <Register
            lang={lang}
            setLang={setLang}
            onRegisterSuccess={handleLoginSuccess}
            onGoToLogin={() => setScreen('login')}
          />
        );
      case 'home':
        return (
          <Home
            lang={lang}
            setLang={setLang}
            role={user?.role}
            onNavigate={(scr) => setScreen(scr)}
          />
        );
      case 'find-workers':
        return (
          <FindWorkers
            lang={lang}
            onNavigate={(scr) => setScreen(scr)}
            onSelectWorker={(id) => {
              setSelectedWorkerId(id);
              setScreen('worker-detail');
            }}
          />
        );
      case 'worker-detail':
        return (
          <WorkerDetail
            lang={lang}
            workerId={selectedWorkerId}
            onBack={() => setScreen('find-workers')}
          />
        );
      case 'find-jobs':
        return (
          <FindJobs
            lang={lang}
            onNavigate={(scr) => setScreen(scr)}
          />
        );
      case 'post-job':
        return (
          <PostJob
            lang={lang}
            onNavigate={(scr) => setScreen(scr)}
          />
        );
      case 'ai-help':
        return (
          <AIHelper
            lang={lang}
            onNavigate={(scr) => setScreen(scr)}
          />
        );
      case 'notifications':
        return (
          <NotificationsList
            lang={lang}
            onNavigate={(scr) => setScreen(scr)}
          />
        );
      case 'profile':
        return (
          <Profile
            lang={lang}
            role={user?.role}
            onLogout={handleLogout}
            onNavigate={(scr) => setScreen(scr)}
          />
        );
      case 'admin-dashboard':
        return (
          <AdminDashboard
            lang={lang}
            onNavigate={(scr) => setScreen(scr)}
          />
        );
      default:
        return <Home lang={lang} role={user?.role} onNavigate={(scr) => setScreen(scr)} />;
    }
  };

  const t = LANG[lang];

  return (
    <div className="app-container">
      {renderScreen()}

      {/* Persistent Bottom Nav if logged in */}
      {user && screen !== 'login' && screen !== 'register' && (
        <div className="bottom-nav">
          <button className={`bn ${screen === 'home' ? 'active' : ''}`} onClick={() => setScreen('home')}>
            <span className="bn-icon">🏠</span>
            <span className="bn-lbl">{t.nav1}</span>
          </button>

          {user.role === 'worker' ? (
            <button className={`bn ${screen === 'find-jobs' ? 'active' : ''}`} onClick={() => setScreen('find-jobs')}>
              <span className="bn-icon">💼</span>
              <span className="bn-lbl">JOBS</span>
            </button>
          ) : (
            <button className={`bn ${screen === 'find-workers' || screen === 'worker-detail' ? 'active' : ''}`} onClick={() => setScreen('find-workers')}>
              <span className="bn-icon">👷</span>
              <span className="bn-lbl">WORKERS</span>
            </button>
          )}

          {user.role === 'employer' ? (
            <button className={`bn ${screen === 'post-job' ? 'active' : ''}`} onClick={() => setScreen('post-job')}>
              <span className="bn-icon">📋</span>
              <span className="bn-lbl">POST JOB</span>
            </button>
          ) : (
            <button className={`bn ${screen === 'ai-help' ? 'active' : ''}`} onClick={() => setScreen('ai-help')}>
              <span className="bn-icon">🤖</span>
              <span className="bn-lbl">AI ASSIST</span>
            </button>
          )}

          <button className={`bn ${screen === 'notifications' ? 'active' : ''}`} onClick={() => setScreen('notifications')}>
            <span className="bn-icon" style={{ position: 'relative' }}>
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  background: 'var(--red)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  fontSize: '9px',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </span>
            <span className="bn-lbl">ALERTS</span>
          </button>

          <button className={`bn ${screen === 'profile' ? 'active' : ''}`} onClick={() => setScreen('profile')}>
            <span className="bn-icon">👤</span>
            <span className="bn-lbl">PROFILE</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
