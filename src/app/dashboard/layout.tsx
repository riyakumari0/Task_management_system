"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Activity, Folder, FileText, Headphones, Settings, Bell, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (!data.user) router.push('/');
      else setUser(data.user);
    });
  }, [router]);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications').then(res => res.json()).then(setNotifications);
      fetch('/api/users').then(res => res.json()).then(setMembers);
    }
  }, [user]);

  const handleMarkAsRead = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      await fetch('/api/notifications/read', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) return <div className="flex-center" style={{height: '100vh'}}>Loading...</div>;

  return (
    <div className="grid-dashboard container">
      {/* Sidebar */}
      <aside className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', color: 'var(--primary)' }}>
          <h2 style={{ color: 'var(--text-main)' }}>AstroTask</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', color: 'var(--primary)', fontWeight: 600, background: 'var(--primary-light)', textDecoration: 'none' }}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/dashboard/track" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>
            <Activity size={20} /> Track
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>
            <Link href="/dashboard/projects" style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'inherit', textDecoration: 'none', flex: 1 }}>
              <Folder size={20} /> Projects
            </Link>
            {user.role === 'ADMIN' && (
              <Link href="/dashboard/projects/new" className="badge" style={{ background: 'var(--primary)', color: '#fff', textDecoration: 'none' }}>
                +
              </Link>
            )}
          </div>
          <Link href="/dashboard/reports" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>
            <FileText size={20} /> Reports
          </Link>
          {user.role === 'ADMIN' && (
            <Link href="/dashboard/members" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>
              <Settings size={20} /> Manage Team
            </Link>
          )}
        </nav>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
          <Link href="/dashboard/support" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>
            <Headphones size={20} /> Support
          </Link>
          <button onClick={() => { fetch('/api/auth/logout', { method: 'POST' }).then(() => router.push('/')); }} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: 500, cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--font-sans)', fontSize: '1rem' }}>
            <Settings size={20} /> Logout
          </button>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main style={{ padding: '0 12px', overflowY: 'auto' }}>
        <header className="flex-between" style={{ marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Hi, {user.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Let's finish your task today!</p>
          </div>
          <div style={{ position: 'relative' }}>
            <div onClick={handleMarkAsRead} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', color: 'var(--primary)', cursor: 'pointer', position: 'relative' }}>
              <Bell size={20} />
              {unreadCount > 0 && <span style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: 'red' }} />}
            </div>
            {showNotifications && (
              <div style={{ position: 'absolute', top: '50px', right: '0', width: '300px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '16px', zIndex: 100 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Notifications</h3>
                {notifications.length === 0 ? <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No notifications yet.</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ padding: '8px', background: n.isRead ? 'transparent' : 'var(--primary-light)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{n.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {children}
      </main>

      {/* Right Panel */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '8px' }}>
        <div className="card" style={{ background: 'var(--primary-light)', padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.5rem', fontWeight: 700 }}>
            {user.name.charAt(0)}
          </div>
          <h3 style={{ fontSize: '1.125rem' }}>{user.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.role === 'ADMIN' ? 'Lead Evaluator' : 'LLM Trainee'} - Lvl {user.level}</p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem' }}>March</h3>
            <button className="badge" style={{ border: 'none', cursor: 'pointer', background: '#f1f5f9', color: 'var(--text-main)' }}>+ Add Task</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            {['mon','tue','wed','thu','fri','sat'].map((d, i) => (
              <div key={d} style={{ textAlign: 'center', padding: '8px', borderRadius: '8px', background: d === 'wed' ? 'var(--primary)' : 'transparent', color: d === 'wed' ? '#fff' : 'var(--text-muted)', width: '40px' }}>
                <div style={{ fontWeight: 700, marginBottom: '4px', color: d === 'wed' ? '#fff' : 'var(--text-main)' }}>{i + 4}</div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{d}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '4px' }}>09:00</div>
              <div style={{ flex: 1, borderLeft: '3px solid var(--primary)', paddingLeft: '12px' }}>
                <div className="flex-between">
                  <h4 style={{ fontSize: '0.875rem' }}>RLHF Annotation</h4>
                  <MoreHorizontal size={16} color="var(--text-muted)" />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10:00am - 12:00pm</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '4px' }}>12:00</div>
              <div style={{ flex: 1, borderLeft: '3px solid var(--primary)', paddingLeft: '12px' }}>
                <div className="flex-between">
                  <h4 style={{ fontSize: '0.875rem' }}>Prompt Eval</h4>
                  <MoreHorizontal size={16} color="var(--text-muted)" />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>12:00pm - 01:00pm</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: 'var(--primary-light)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '16px', textAlign: 'center' }}>Members</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {members.length === 0 ? <p style={{ fontSize: '0.75rem', textAlign: 'center' }}>No members yet.</p> : members.map((member, i) => (
              <div key={i} className="card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'none' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{member.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{member.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>LLM Data Trainee</div>
                </div>
              </div>
            ))}
          </div>
          <button style={{ width: '100%', padding: '8px', background: '#fff', border: 'none', borderRadius: '16px', marginTop: '16px', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem' }}>See all</button>
        </div>
      </aside>
    </div>
  );
}
