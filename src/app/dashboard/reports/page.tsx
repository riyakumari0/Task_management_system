"use client";
import { useEffect, useState } from 'react';

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      setUser(data.user);
    });
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2 style={{ marginBottom: '24px' }}>Evaluation Reports</h2>
      {user.role === 'ADMIN' ? (
        <div>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Global Trainee Performance Report</h3>
          <div style={{ padding: '24px', background: 'var(--primary-light)', borderRadius: '12px', marginBottom: '16px' }}>
            <p><strong>System Health:</strong> Excellent</p>
            <p><strong>Total Active Trainees:</strong> Evaluator Access Granted</p>
            <p><strong>Average Accuracy:</strong> 94%</p>
          </div>
          <button className="btn-primary">Download CSV Report</button>
        </div>
      ) : (
        <div>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Your Evaluation Quality Report</h3>
          <div style={{ padding: '24px', background: 'var(--primary-light)', borderRadius: '12px', marginBottom: '16px' }}>
            <p><strong>Your Accuracy:</strong> 96%</p>
            <p><strong>Feedback:</strong> "Great attention to detail on the safety guidelines evaluation!"</p>
          </div>
          <button className="btn-primary">Download My Report</button>
        </div>
      )}
    </div>
  );
}
