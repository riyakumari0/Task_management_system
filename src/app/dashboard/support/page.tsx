"use client";
import { useEffect, useState } from 'react';

export default function SupportPage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => setUser(data.user));
    fetchMessages();
  }, []);

  const fetchMessages = () => {
    fetch('/api/support').then(r => r.json()).then(data => {
      if (data.messages) setMessages(data.messages);
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Optimistically add user message
    const tempMsg = { id: Date.now(), message: input, isBot: false, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setInput('');
    
    await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: tempMsg.message })
    });
    
    // Refetch to get bot response
    fetchMessages();
  };

  const handleAction = async (userId: string, action: string) => {
    await fetch('/api/support/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action })
    });
    fetchMessages();
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="card" style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '8px' }}>AI Support Chat</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        {user.role === 'ADMIN' ? 'Monitoring all trainee support requests.' : 'Chat with our AI bot if you face issues evaluating prompts.'}
      </p>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', background: 'var(--bg-dashboard)', borderRadius: '12px', marginBottom: '24px' }}>
        {messages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No messages yet.</div>}
        
        {messages.map((m: any) => {
          const isAdminViewOfUserMsg = user.role === 'ADMIN' && m.user;
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.isBot ? 'flex-start' : 'flex-end' }}>
              {isAdminViewOfUserMsg && !m.isBot && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{m.user.name}</div>}
              {isAdminViewOfUserMsg && m.isBot && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>AI Bot (to {m.user.name})</div>}
              
              <div style={{ 
                maxWidth: '70%', 
                padding: '12px 16px', 
                borderRadius: '16px', 
                background: m.isBot ? 'var(--primary-light)' : 'var(--primary)',
                color: m.isBot ? 'var(--text-main)' : '#fff',
                borderBottomLeftRadius: m.isBot ? '4px' : '16px',
                borderBottomRightRadius: m.isBot ? '16px' : '4px',
              }}>
                {/* Render newlines properly for the overview */}
                {m.message.split('\n').map((line: string, i: number) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
              
              {/* Action Buttons for Admin on Escalation messages */}
              {isAdminViewOfUserMsg && m.isBot && m.message.includes('ADMIN ESCALATION') && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button onClick={() => handleAction(m.user.id, 'processing')} style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                    Mark Processing
                  </button>
                  <button onClick={() => handleAction(m.user.id, 'solved')} style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                    Mark Solved
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {user.role === 'MEMBER' && (
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            className="input-clean" 
            style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} 
            placeholder="Type your issue here..." 
            value={input} 
            onChange={e => setInput(e.target.value)} 
          />
          <button type="submit" className="btn-primary">Send</button>
        </form>
      )}
      {user.role === 'ADMIN' && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Admins are in monitoring mode. You cannot reply directly as the bot handles initial triage.
        </div>
      )}
    </div>
  );
}
