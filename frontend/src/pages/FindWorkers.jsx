import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { LANG, TRADES } from '../services/constants';

const FindWorkers = ({ lang, onNavigate, onSelectWorker }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState('');

  const t = LANG[lang];

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      let endpoint = '/workers?';
      if (selectedTrade) endpoint += `trade=${selectedTrade}&`;
      if (availability) endpoint += `availability=${availability}&`;
      if (search) endpoint += `search=${search}&`;

      const data = await apiCall(endpoint);
      setWorkers(data);
    } catch (err) {
      console.error('Failed to fetch workers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [selectedTrade, availability, search]);

  return (
    <div className="screen active">
      <div className="topbar">
        <button className="topbar-back" onClick={() => onNavigate('home')}>‹</button>
        <div className="topbar-title">{t.fwTitle}</div>
      </div>

      <div className="scroll-body">
        {/* Search */}
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <input
            type="text"
            className="form-input"
            placeholder={lang === 'hi' ? '🔍 नाम या जगह से खोजें...' : lang === 'mr' ? '🔍 नाव किंवा ठिकाणावरून शोधा...' : '🔍 Search by name or location...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Availability Select */}
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <select
            className="form-select"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="">{lang === 'hi' ? 'सभी उपलब्धता' : lang === 'mr' ? 'सर्व उपलब्धता' : 'Any Availability'}</option>
            <option value="now">{t.availNow}</option>
            <option value="soon">{t.availSoon}</option>
            <option value="busy">{t.availBusy}</option>
          </select>
        </div>

        {/* Horizontal Trade Filter */}
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

        {/* Results */}
        <div className="sec-lbl">{lang === 'hi' ? 'कामगार सूची' : lang === 'mr' ? 'कामगार यादी' : 'Workers Available'}</div>
        {loading ? (
          <div className="spinner" style={{ marginTop: '20px' }}></div>
        ) : workers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👷</div>
            <div className="empty-title">
              {lang === 'hi' ? 'कोई कामगार नहीं मिला' : lang === 'mr' ? 'कोणताही कामगार सापडला नाही' : 'No Workers Found'}
            </div>
            <div className="empty-sub">
              {lang === 'hi' ? 'अलग हुनर या जगह चुनकर फिर से प्रयास करें।' : lang === 'mr' ? 'दुसरे कौशल्य निवडून पुन्हा प्रयत्न करा.' : 'Try changing your filter settings.'}
            </div>
          </div>
        ) : (
          workers.map((worker) => {
            const availClass = worker.availability === 'now' ? 'avail-now' : worker.availability === 'soon' ? 'avail-soon' : 'avail-busy';
            const availText = worker.availability === 'now' ? t.availNow : worker.availability === 'soon' ? t.availSoon : t.availBusy;
            
            return (
              <div 
                key={worker._id} 
                className="worker-card"
                onClick={() => onSelectWorker(worker._id)}
              >
                <div className="wc-row1">
                  <div 
                    className="wc-avatar" 
                    style={{ 
                      backgroundColor: worker.avatarColor || '#F05A1A',
                      backgroundImage: worker.profileImage ? `url(http://localhost:5000${worker.profileImage})` : 'none' 
                    }}
                  >
                    {!worker.profileImage && worker.name.charAt(0).toUpperCase()}
                    <div className="wc-verified-badge">✓</div>
                  </div>
                  <div className="wc-info">
                    <div className="wc-name">{worker.name}</div>
                    <div className="wc-trade">
                      {lang === 'hi' 
                        ? (TRADES.find(tr => tr.name === worker.trade)?.hi || worker.trade) 
                        : lang === 'mr' 
                          ? (TRADES.find(tr => tr.name === worker.trade)?.mr || worker.trade) 
                          : worker.trade
                      }
                    </div>
                    <div className="wc-loc">📍 {worker.locationName}</div>
                  </div>
                  <div className={`wc-avail ${availClass}`}>{availText}</div>
                </div>
                <div className="wc-row2">
                  <div className="wc-rate">
                    ₹{worker.wage} <span>/{lang === 'hi' ? 'दिन' : lang === 'mr' ? 'दिवस' : 'day'}</span>
                  </div>
                  <div className="wc-rating">
                    ⭐ 4.8 ({worker.jobsCount || 0} {lang === 'hi' ? 'काम' : lang === 'mr' ? 'कामे' : 'jobs'})
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

export default FindWorkers;
