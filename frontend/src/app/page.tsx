'use client';

import Link from 'next/link';
import { GraduationCap, ArrowRight, Users, BookOpen, Settings, BarChart3, Shield } from 'lucide-react';

const features = [
  {
    icon: GraduationCap,
    title: 'Academics Management',
    description: 'Manage courses, departments, faculties, and academic sessions',
  },
  {
    icon: Users,
    title: 'Student & Staff Portal',
    description: 'Comprehensive portal for students, lecturers, and administrators',
  },
  {
    icon: BookOpen,
    title: 'Learning Management',
    description: 'LMS with course materials, assignments, and discussions',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Real-time dashboards and comprehensive reports',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant Security',
    description: 'Secure multi-institution support with role-based access',
  },
  {
    icon: Settings,
    title: 'Customizable Grading',
    description: 'Nigerian & American grading systems with GPA calculation',
  },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)' }}>
      {/* Header */}
      <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <GraduationCap size={32} color="#3B82F6" />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>EduSaaS</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/auth/login" style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', color: 'white', textDecoration: 'none' }}>
            Sign In
          </Link>
          <Link href="/dashboard" style={{ padding: '0.5rem 1.5rem', background: '#3B82F6', borderRadius: '8px', color: 'white', textDecoration: 'none' }}>
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          Modern University & Polytechnic<br />Management Portal
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#BFDBFE', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          A comprehensive, multi-tenant platform designed for Nigerian and global universities. 
          Manage academics, finance, students, and more with customizable grading systems.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/auth/login" style={{ 
            padding: '1rem 2rem', 
            background: '#3B82F6', 
            borderRadius: '12px', 
            color: 'white', 
            fontSize: '1.125rem',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Start Free Trial <ArrowRight size={20} />
          </Link>
          <Link href="/dashboard" style={{ 
            padding: '1rem 2rem', 
            background: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px', 
            color: 'white', 
            fontSize: '1.125rem',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            View Demo
          </Link>
        </div>

        {/* Features Grid */}
        <div style={{ marginTop: '6rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '3rem' }}>Key Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {features.map((feature, index) => (
              <div key={index} style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '2rem', 
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'left'
              }}>
                <feature.icon size={32} color="#60A5FA" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginTop: '1rem' }}>{feature.title}</h3>
                <p style={{ color: '#BFDBFE', marginTop: '0.5rem' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginTop: '6rem', display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white' }}>50+</div>
            <div style={{ color: '#BFDBFE' }}>Institutions</div>
          </div>
          <div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white' }}>100K+</div>
            <div style={{ color: '#BFDBFE' }}>Active Users</div>
          </div>
          <div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white' }}>99.9%</div>
            <div style={{ color: '#BFDBFE' }}>Uptime</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: '#94A3B8' }}>© 2026 EduSaaS. Built for Nigerian Education.</p>
      </footer>
    </div>
  );
}