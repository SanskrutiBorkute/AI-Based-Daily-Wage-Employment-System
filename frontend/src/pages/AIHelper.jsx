import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../services/api';
import { LANG } from '../services/constants';
import VoiceInput from '../components/VoiceInput';

const AIHelper = ({ lang, onNavigate }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [careerTips, setCareerTips] = useState(null);
  const [careerLoading, setCareerLoading] = useState(false);

  const t = LANG[lang];
  const messagesEndRef = useRef(null);
  const role = localStorage.getItem('ks_role');

  // Load custom career advice if worker
  useEffect(() => {
    if (role === 'worker') {
      const fetchCareerAdvice = async () => {
        setCareerLoading(true);
        try {
          const res = await apiCall('/ai/career-advice');
          setCareerTips(res);
        } catch (err) {
          console.error('Career advice error:', err.message);
        } finally {
          setCareerLoading(false);
        }
      };
      fetchCareerAdvice();
    }
  }, [role]);

  // Initial greeting message
  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: t.aiIntro
      }
    ]);
  }, [lang]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Add User message
    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      console.log("FRONTEND LANG:", lang);
      const res = await apiCall('/ai/chat', 'POST', {
        message: text,
        language: lang
      });

      // Add AI reply
      setMessages(prev => [...prev, { sender: 'ai', text: res.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen active" style={{
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 60px)'
}}>   
      <div className="topbar">
        <button className="topbar-back" onClick={() => onNavigate('home')}>‹</button>
        <div className="topbar-title">{t.aiTitle}</div>
      </div>

      <div className="scroll-body" style={{
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflowY: 'auto',
  paddingBottom: '80px'
}}>
        
        {/* Customized Career Growth Advice Section (Worker Only) */}
        {role === 'worker' && (
          <div className="card" style={{ border: '1.5px solid var(--orange)', background: 'var(--orange-l)', padding: '12px', marginBottom: '14px', borderRadius: '12px' }}>
            <h4 style={{ color: 'var(--orange)', fontSize: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
              💡 Personal Career Growth Tips
            </h4>
            {careerLoading ? (
              <div className="spinner" style={{ margin: '10px auto', width: '20px', height: '20px' }}></div>
            ) : careerTips ? (
              <div>
                <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--ink)' }}>🛠 Suggested Skills to Learn:</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '5px 0' }}>
                  {careerTips.skills?.map((skill, idx) => (
                    <span key={idx} style={{ background: '#fff', border: '1px solid var(--border)', fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
                      {skill}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--ink2)', marginTop: '6px', lineHeight: '1.4' }}>
                  <strong>Next Step:</strong> {careerTips.nextSteps}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--ink3)' }}>Complete your profile to get customized tips.</p>
            )}
          </div>
        )}

        {/* Message logs */}
        <div className="chat-wrap" style={{ flex: 1 }}>
          {messages.map((msg, index) => (
            <div key={index} className={`chat-msg ${msg.sender}`}>
              {msg.sender === 'ai' && <div className="ai-label">KaamSetu AI</div>}
              <div>{msg.text}</div>
            </div>
          ))}

          {loading && (
            <div className="chat-msg ai">
              <div className="ai-label">Thinking...</div>
              <div style={{ display: 'flex', alignItems: 'center', height: '16px' }}>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions list */}
        {messages.length === 1 && (
          <div style={{ marginBottom: '12px' }}>
            <div className="sec-lbl" style={{ fontSize: '11px', marginBottom: '6px' }}>{t.aiQuickLbl}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {t.quickQs.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  style={{
                    background: '#fff',
                    border: '1.5px solid var(--border)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--ink2)',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  ❓ {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Input Area */}
        <div className="chat-input-row">
          <input
            type="text"
            className="chat-input"
            placeholder={lang === 'hi' ? 'सवाल पूछें...' : lang === 'mr' ? 'प्रश्न विचारा...' : 'Ask your question...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <VoiceInput
            lang={lang}
            onTranscript={(text) => handleSend(text)}
            labelSpeak="🎙"
            labelListening="🔴"
            labelError="Could not hear, please try again."
          />
          <button className="chat-send" onClick={() => handleSend()} disabled={loading}>
            ➤
          </button>
        </div>

      </div>
    </div>
  );
};

export default AIHelper;
