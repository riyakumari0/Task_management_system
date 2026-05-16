"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(data => {
      if(Array.isArray(data)) setUsers(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, memberIds: selectedUsers })
    });
    if (res.ok) router.push('/dashboard');
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>New Project</h2>
      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Project Name</label>
            <input required type="text" className="input-clean" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Description</label>
            <textarea className="input-clean" value={description} onChange={e => setDescription(e.target.value)} rows={4} />
          </div>
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.875rem', fontWeight: 600 }}>Assign Team Members</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--primary-light)', padding: '16px', borderRadius: '12px' }}>
            {users.length === 0 ? <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No members found. Please add members first.</p> : users.map(u => (
              <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                <input 
                  type="checkbox" 
                  checked={selectedUsers.includes(u.id)}
                  onChange={e => {
                    if (e.target.checked) setSelectedUsers([...selectedUsers, u.id]);
                    else setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                  }}
                  style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                />
                {u.name} <span style={{ color: 'var(--text-muted)' }}>({u.email})</span>
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Create Project</button>
      </form>
      </div>
    </div>
  );
}
