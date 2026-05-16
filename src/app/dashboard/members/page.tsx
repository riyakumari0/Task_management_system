"use client";
import { useEffect, useState } from 'react';
import { CheckCircle, Plus } from 'lucide-react';

export default function MembersPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [users, setUsers] = useState([{ name: '', email: '' }]);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [addMessage, setAddMessage] = useState('');

  const handleAddRow = () => setUsers([...users, { name: '', email: '' }]);
  const handleRemoveRow = (index: number) => {
    if (users.length > 1) {
      setUsers(users.filter((_, i) => i !== index));
    }
  };
  const handleUserChange = (index: number, field: 'name' | 'email', value: string) => {
    const newUsers = [...users];
    newUsers[index][field] = value;
    setUsers(newUsers);
  };

  const fetchPending = async () => {
    const res = await fetch('/api/users/pending');
    if (res.ok) {
      const data = await res.json();
      setPendingUsers(data);
    }
    setLoading(false);
  };

  const fetchActive = async () => {
    const res = await fetch('/api/users?limit=none');
    if (res.ok) {
      const data = await res.json();
      setActiveUsers(data);
    }
  };

  useEffect(() => {
    fetchPending();
    fetchActive();
  }, []);

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/users/${id}/approve`, { method: 'PATCH' });
    if (res.ok) {
      fetchPending();
      fetchActive();
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!confirm('Are you sure you want to permanently remove this member?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchActive();
    } else {
      alert('Failed to remove member');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMessage('');
    const res = await fetch('/api/users/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users, password, role })
    });
    const data = await res.json();
    if (res.ok) {
      setAddMessage(`Successfully added ${data.count} user(s)!`);
      setUsers([{ name: '', email: '' }]);
      setPassword('');
      fetchActive();
    } else {
      setAddMessage(data.error || 'Failed to add user');
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Team Management</h2>

      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-main)' }}>Pending Approvals</h3>
        {loading ? <p>Loading...</p> : pendingUsers.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No pending users.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingUsers.map(user => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--primary-light)', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.email} • {user.role === 'ADMIN' ? 'Lead Evaluator' : 'LLM Trainee'}</div>
                </div>
                <button onClick={() => handleApprove(user.id)} className="btn-orange" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                  <CheckCircle size={16} /> Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-main)' }}>Active Team</h3>
        {activeUsers.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No active members.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeUsers.map(user => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--primary-light)', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.email} • Lvl {user.level} ({user.xp} XP)</div>
                </div>
                <button onClick={() => handleRemoveMember(user.id)} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-main)' }}>Manually Add User</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Users added here are automatically approved and can log in immediately.</p>
        
        {addMessage && (
          <div style={{ padding: '12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px', marginBottom: '24px', fontSize: '0.875rem', fontWeight: 600 }}>
            {addMessage}
          </div>
        )}

        <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.map((u, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  {i === 0 && <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Name</label>}
                  <input required type="text" className="input-clean" value={u.name} onChange={e => handleUserChange(i, 'name', e.target.value)} placeholder="Full Name" />
                </div>
                <div style={{ flex: 1 }}>
                  {i === 0 && <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Email</label>}
                  <input required type="email" className="input-clean" value={u.email} onChange={e => handleUserChange(i, 'email', e.target.value)} placeholder="Email Address" />
                </div>
                {users.length > 1 && (
                  <button type="button" onClick={() => handleRemoveRow(i)} style={{ padding: '0 12px', background: 'var(--danger, #ef4444)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', height: '42px', fontWeight: 'bold' }}>
                    X
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={handleAddRow} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', padding: '4px 0' }}>
            + Add another member
          </button>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Shared Password</label>
            <input required type="text" className="input-clean" value={password} onChange={e => setPassword(e.target.value)} placeholder="Initial Password for all users" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Role</label>
            <select className="input-clean" value={role} onChange={e => setRole(e.target.value)}>
              <option value="MEMBER">LLM Trainee</option>
              <option value="ADMIN">Lead Evaluator</option>
            </select>
          </div>
          <button type="submit" className="btn-orange" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            <Plus size={16} /> Add User(s)
          </button>
        </form>
      </div>
    </div>
  );
}
