"use client";
import { useEffect, useState } from 'react';

export default function TrackPage() {
  const [user, setUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any>(null);
  
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      setUser(data.user);
      if (data.user?.role === 'ADMIN') {
        fetch('/api/users').then(r => r.json()).then(setAllUsers);
      }
    });
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2 style={{ marginBottom: '24px' }}>Trainee Progress Tracker</h2>
      {user.role === 'ADMIN' ? (
        <div>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Lead Evaluator View - All Trainees</h3>
          {allUsers ? (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '16px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px' }}>Trainee Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Level</th>
                  <th style={{ padding: '12px' }}>Total XP</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.users?.map((u: any) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}><span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{u.role}</span></td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{u.level}</td>
                    <td style={{ padding: '12px', color: 'var(--secondary)', fontWeight: 700 }}>{u.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Loading trainees...</p>
          )}
        </div>
      ) : (
        <div>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Your Personal Progress</h3>
          <div style={{ marginTop: '16px', display: 'flex', gap: '24px' }}>
            <div className="card" style={{ background: 'var(--primary-light)', flex: 1 }}>
              <h4>Current Level</h4>
              <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--primary)' }}>{user.level}</p>
            </div>
            <div className="card" style={{ background: '#ffedd5', flex: 1 }}>
              <h4>Total XP Earned</h4>
              <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--secondary)' }}>{user.xp}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
