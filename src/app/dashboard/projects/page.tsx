"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Folder, Users, LayoutList } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading projects...</div>;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>All Projects</h2>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px' }}>
          No projects found. Ask an Admin to create one!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {projects.map(project => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Folder size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.125rem' }}>{project.name}</h3>
                </div>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', flex: 1, marginBottom: '24px' }}>
                  {project.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LayoutList size={16} /> {project._count?.tasks || 0} Tasks
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} /> Team
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
