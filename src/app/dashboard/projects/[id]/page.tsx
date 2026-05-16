"use client";
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, Play } from 'lucide-react';

export default function ProjectBoard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigneeId: '' });
  const [bulkData, setBulkData] = useState('');
  const [bulkAssignee, setBulkAssignee] = useState('');
  const [user, setUser] = useState<any>(null);
  
  // Focus Mode State
  const [focusTask, setFocusTask] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => setUser(data.user));
    fetch(`/api/tasks?projectId=${id}`).then(r => r.json()).then(setTasks);
    fetch('/api/users').then(r => r.json()).then(setUsers).catch(() => {}); // admins only
  }, [id]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTask, projectId: id })
    });
    if (res.ok) {
      const created = await res.json();
      setTasks([...tasks, created]);
      setShowNewTask(false);
      setNewTask({ title: '', description: '', assigneeId: '' });
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let tasksToCreate: any[] = [];
    try {
      const parsed = JSON.parse(bulkData);
      if (Array.isArray(parsed)) {
        tasksToCreate = parsed.map(p => ({
          title: p.title || p.prompt || 'Untitled Task',
          description: p.description || '',
          projectId: id,
          assigneeId: bulkAssignee || null
        }));
      }
    } catch {
      // Fallback to plain text line-by-line
      tasksToCreate = bulkData.split('\n').map(line => line.trim()).filter(line => line.length > 0).map(line => ({
        title: line,
        description: '',
        projectId: id,
        assigneeId: bulkAssignee || null
      }));
    }

    if (tasksToCreate.length > 0) {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasksToCreate)
      });
      if (res.ok) {
        fetch(`/api/tasks?projectId=${id}`).then(r => r.json()).then(setTasks);
        setShowNewTask(false);
        setBulkData('');
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      const data = await res.json();
      setTasks(tasks.map(t => t.id === taskId ? data.task : t));
      if (data.xpAwarded) {
        alert(`🎉 +${data.xpAwarded} XP Earned!`);
        window.location.reload(); // Refresh to update layout XP bar
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Project Board</h2>
        {user?.role === 'ADMIN' && (
          <button className="btn-primary" onClick={() => setShowNewTask(!showNewTask)}>
            + New Task
          </button>
        )}
      </div>

      {showNewTask && (
        <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            <button onClick={() => setIsBulkMode(false)} style={{ background: 'none', border: 'none', fontWeight: 600, color: !isBulkMode ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}>Single Task</button>
            <button onClick={() => setIsBulkMode(true)} style={{ background: 'none', border: 'none', fontWeight: 600, color: isBulkMode ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}>Bulk Paste Upload</button>
          </div>

          {!isBulkMode ? (
            <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <input required type="text" className="input-clean" placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} style={{ flex: 1, minWidth: '200px' }} />
              <input type="text" className="input-clean" placeholder="Description" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} style={{ flex: 2, minWidth: '300px' }} />
              <select className="input-clean" value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})} style={{ flex: 1, minWidth: '150px' }}>
                <option value="">Assign Member</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <button type="submit" className="btn-orange">Deploy Task</button>
            </form>
          ) : (
            <form onSubmit={handleBulkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Paste a list of prompts (each line becomes a task) or a valid JSON array.</p>
              <textarea 
                className="input-clean" 
                rows={6} 
                placeholder="Paste your prompts here..."
                value={bulkData}
                onChange={e => setBulkData(e.target.value)}
                required
              />
              <div style={{ display: 'flex', gap: '16px' }}>
                <select className="input-clean" value={bulkAssignee} onChange={e => setBulkAssignee(e.target.value)} style={{ flex: 1, maxWidth: '250px' }}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>Assign to: {u.name}</option>)}
                </select>
                <button type="submit" className="btn-primary">Upload Bulk Tasks</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="grid-cards">
        {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map(status => (
          <div key={status} style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: '16px', minHeight: '400px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`badge badge-${status.toLowerCase().replace('_', '-')}`} style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px' }}>
                {status.replace('_', ' ')}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '1rem' }}>{task.title}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{task.description}</p>
                  
                  <div className="flex-between" style={{ marginTop: 'auto', gap: '8px', flexWrap: 'wrap' }}>
                    <select 
                      className="input-clean" 
                      style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
                      value={task.status}
                      onChange={e => handleStatusChange(task.id, e.target.value)}
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="REVIEW">REVIEW</option>
                      <option value="DONE">DONE</option>
                    </select>

                    {task.status === 'IN_PROGRESS' && task.assigneeId === user?.id && (
                      <button 
                        onClick={() => { setFocusTask(task); setTimeLeft(25*60); setIsActive(false); }}
                        style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        <Play size={14} fill="currentColor" /> Focus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Focus Mode Modal */}
      {focusTask && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ padding: '48px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
            <h2 style={{ marginBottom: '8px', color: 'var(--primary)', fontSize: '1.5rem' }}>Focus Mode</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{focusTask.title}</p>
            
            <div style={{ fontSize: '4rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '32px', color: 'var(--text-main)' }}>
              {formatTime(timeLeft)}
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => setIsActive(!isActive)}>
                {isActive ? 'Pause' : 'Start Focus'}
              </button>
              <button 
                onClick={() => { setFocusTask(null); setIsActive(false); }}
                style={{ padding: '12px 24px', borderRadius: '8px', background: '#e2e8f0', color: 'var(--text-main)', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
