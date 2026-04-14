'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/dashboard');
    } catch (err: any) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Panel - Branding */}
      <div style={{ display: 'none', flex: '1', background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', padding: '3rem', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4rem' }}>
          <GraduationCap size={32} />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>EduSaaS</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          Transform Your Institution's Digital Future
        </h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>
          The complete platform for Nigerian universities and polytechnics. Manage academics, students, finance, and more.
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <GraduationCap size={40} color="#1E3A8A" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1F2937' }}>Welcome Back</h2>
            <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>Sign in to continue</p>
          </div>

          {error && (
            <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@institution.edu"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '1rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4B5563' }}>
                <input type="checkbox" /> Remember me
              </label>
              <Link href="/auth/forgot-password" style={{ color: '#3B82F6' }}>Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '0.875rem', background: '#1E3A8A', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: '#6B7280' }}>
            Don't have an account? <Link href="/auth/register" style={{ color: '#3B82F6', fontWeight: '600' }}>Contact Admin</Link>
          </p>
        </div>
      </div>
    </div>
  );
}