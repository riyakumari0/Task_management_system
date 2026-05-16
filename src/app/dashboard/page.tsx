"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      setUser(data.user);
      if (data.user) {
        fetch('/api/projects').then(r => r.json()).then(setProjects);
        if (data.user.role === 'ADMIN') {
          fetch('/api/users/leaderboard').then(r => r.json()).then(setLeaderboard);
        }
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Banner */}
      <div className="card" style={{ background: 'var(--primary-light)', padding: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '60%', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-main)' }}>
            {isAdmin ? 'Lead Evaluator Overview' : 'Today Task'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            {isAdmin ? 'Monitor deployment progress and team performance.' : 'Check your daily tasks and schedules'}
          </p>
          <button className="btn-primary" style={{ borderRadius: '12px' }}>
            {isAdmin ? 'View Reports' : 'Today\'s schedule'}
          </button>
        </div>
        <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', width: '250px', height: '250px', backgroundImage: 'url(/dashboard_banner_green.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
      </div>

      {isAdmin ? (
        // --- ADMIN VIEW ---
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Active Deployments (Projects) */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Active Deployments</h3>
            {projects.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No active projects found. Create one!</div>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {projects.map((project: any) => {
                const totalTasks = project.tasks?.length || 0;
                const doneTasks = project.tasks?.filter((t: any) => t.status === 'DONE').length || 0;
                const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
                
                return (
                  <div key={project.id} style={{ padding: '16px', background: 'var(--primary-light)', borderRadius: '12px' }}>
                    <div className="flex-between" style={{ marginBottom: '12px' }}>
                      <Link href={`/dashboard/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{project.name}</h4>
                      </Link>
                      <span className="badge" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 600 }}>{progress}% Complete</span>
                    </div>
                    
                    <div className="progress-bg" style={{ marginBottom: '8px' }}>
                      <div className="progress-fill" style={{ width: `${progress}%`, background: 'var(--primary)' }}></div>
                    </div>
                    
                    <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{doneTasks} of {totalTasks} Tasks Completed</span>
                      <span>{project.description || 'No description'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Performers Leaderboard */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Top Performers</h3>
            {leaderboard.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No performers yet.</div>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaderboard.map((member: any, idx: number) => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--primary-light)', borderRadius: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: idx === 0 ? '#f59e0b' : 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{member.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Level {member.level} Trainee</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--secondary)' }}>{member.xp}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // --- MEMBER VIEW (Original) ---
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {projects.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No active projects found. Wait for an assignment.</div>}
            {projects.map((project: any, index) => {
              const colors = [ 'var(--primary)', 'var(--secondary)', '#ec4899', '#3b82f6' ];
              const c = colors[index % colors.length];
              
              const totalTasks = project.tasks?.length || 0;
              const doneTasks = project.tasks?.filter((t: any) => t.status === 'DONE').length || 0;
              const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

              return (
                <Link href={`/dashboard/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>{project.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.description || 'Designing'}</p>
                    
                    <div style={{ marginTop: 'auto' }}>
                      <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                        <span>Progress</span>
                        <span style={{ fontWeight: 600 }}>{progress}%</span>
                      </div>
                      <div className="progress-bg" style={{ marginBottom: '16px' }}>
                        <div className="progress-fill" style={{ width: `${progress}%`, background: c }}></div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
            {/* Tasks Progress Chart Dummy */}
            <div className="card">
              <div className="flex-between" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem' }}>Tasks Progress</h3>
                <select className="input-clean" style={{ width: 'auto', padding: '4px', border: 'none', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.75rem' }}>
                  <option>Weekly</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', position: 'relative' }}>
                  {[60, 40, 30, 80, 50, 20, 10].map((h, i) => (
                    <div key={i} style={{ width: '12px', height: `${h}%`, background: 'var(--primary)', borderRadius: '6px 6px 0 0' }}></div>
                  ))}
                  {/* Y Axis Labels */}
                  <div style={{ position: 'absolute', left: '-20px', top: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    <span>05</span><span>04</span><span>03</span><span>02</span><span>01</span><span>0</span>
                  </div>
                </div>
                <div style={{ width: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Tokens Reviewed</div>
                    <div className="flex-between"><span style={{ fontWeight: 700 }}>150k</span> <span className="badge" style={{ background: '#ffedd5', color: 'var(--secondary)' }}>+12%</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Prompts Created</div>
                    <div className="flex-between"><span style={{ fontWeight: 700 }}>320</span> <span className="badge" style={{ background: '#ffedd5', color: 'var(--secondary)' }}>+5%</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Models Tuned</div>
                    <div className="flex-between"><span style={{ fontWeight: 700 }}>5</span> <span className="badge" style={{ background: '#ffedd5', color: 'var(--secondary)' }}>100%</span></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingLeft: '4px', paddingRight: '120px', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
            </div>

            {/* Assignments Dummy */}
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Eval Batches (12)</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--secondary)' }}></span> 2/5 completed
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[{title: 'Safety Guidelines Eval', date: '01 Feb 2024', grade: '86/100', checked: true}, {title: 'Reasoning Prompts', date: '01 Feb 2024', grade: '90/100', checked: true}, {title: 'RLHF Preference Ranking', date: '13 Mar 2024', grade: '0/100', checked: false}].map((a, i) => (
                  <div key={i} className="flex-between">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={a.checked} readOnly style={{ accentColor: 'var(--primary)', marginTop: '4px' }} />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: a.checked ? 'var(--text-main)' : 'var(--text-muted)' }}>{a.title}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{a.date}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{a.grade}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{a.checked ? 'Score' : 'Pending'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
