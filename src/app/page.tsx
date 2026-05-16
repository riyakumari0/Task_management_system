"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { email, password, name, role };
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (res.ok) {
        if (data.message) {
          // Registration success but pending approval
          setIsLogin(true);
          setError(data.message);
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error occurred.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#e6f4ea', /* Soft green fallback */
      padding: '24px'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1000px',
        height: '600px',
        backgroundColor: '#fff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Background Image Container */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 0,
          backgroundImage: 'url(/botanical_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />

        {/* White Organic Overlay containing the form */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '10%',
          width: '70%',
          height: '120%',
          backgroundColor: '#fff',
          zIndex: 1,
          borderRadius: '43% 57% 41% 59% / 44% 53% 47% 56%', /* Organic blob shape */
          display: 'flex',
          flexDirection: 'column',
          padding: '10% 12%',
        }}>
          {/* Header */}
          <div className="flex-between" style={{ marginBottom: '48px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#f59e0b', fontSize: '1.25rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🌸</span> AstroTask
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              <span style={{ cursor: 'pointer', color: isLogin ? '#f59e0b' : 'inherit' }} onClick={() => setIsLogin(true)}>Sign In</span> | 
              <span style={{ cursor: 'pointer', color: !isLogin ? '#f59e0b' : 'inherit' }} onClick={() => setIsLogin(false)}> Sign Up</span>
            </div>
          </div>

          {/* Form Area */}
          <div style={{ maxWidth: '350px', margin: '0 auto', width: '100%' }}>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '4px', fontWeight: 400 }}>Hello there,</h1>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '8px', fontWeight: 700 }}>LLM Trainee Portal</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '40px' }}>Sign in to manage your annotation and evaluation tasks.</p>
            
            {error && (
              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '24px', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {!isLogin && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-main)', marginBottom: '4px' }}>FULL NAME</label>
                    <input required type="text" className="input-clean" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-main)', marginBottom: '4px' }}>ROLE</label>
                    <select className="input-clean" value={role} onChange={e => setRole(e.target.value)}>
                      <option value="MEMBER">LLM Trainee</option>
                      <option value="ADMIN">Lead Evaluator</option>
                    </select>
                  </div>
                </>
              )}
              
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase' }}>Email</label>
                <input required type="email" className="input-clean" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-main)', marginBottom: '4px', textTransform: 'uppercase' }}>Password</label>
                <input required type="password" className="input-clean" value={password} onChange={e => setPassword(e.target.value)} placeholder="Set a strong password" />
                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Forgot password?</span>
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <button type="submit" className="btn-orange">
                  {isLogin ? 'LOGIN' : 'SIGN UP'}
                </button>
              </div>
            </form>
          </div>
          
          <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
            <span>Sign in with:</span>
            <span style={{ fontWeight: 'bold', color: '#f59e0b', cursor: 'pointer' }}>G</span>
            <span style={{ fontWeight: 'bold', color: '#f59e0b', cursor: 'pointer' }}>X</span>
            <span style={{ fontWeight: 'bold', color: '#f59e0b', cursor: 'pointer' }}>f</span>
          </div>
        </div>
      </div>
    </div>
  );
}
