/**
 * Ultra-Modern Student Dashboard
 * Clean, user-centric, empathetic design
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const student = {
    name: 'Ahmed Musa',
    email: 'ahmed.musa@university.edu.ng',
    matricNumber: '2023/CSC/001',
    level: '200 Level',
    faculty: 'Computing Sciences',
    department: 'Computer Science',
    gpa: '3.85',
    cgpa: '3.72',
    image: null,
  };

  const quickActions = [
    { icon: '📚', label: 'My Courses', color: 'bg-blue-500', count: 6 },
    { icon: '📝', label: 'Results', color: 'bg-green-500', count: 5 },
    { icon: '💳', label: 'Pay Fees', color: 'bg-orange-500', badge: 'Due' },
    { icon: '📅', label: 'Timetable', color: 'bg-purple-500', count: 4 },
    { icon: '📖', label: 'Library', color: 'bg-red-500', count: 2 },
    { icon: '🏠', label: 'Hostel', color: 'bg-teal-500', status: 'Applied' },
  ];

  const todayClasses = [
    { time: '08:00', course: 'CSC201', title: 'Data Structures', venue: 'Lab 3', lecturer: 'Dr. Adebayo' },
    { time: '10:00', course: 'CSC203', title: 'Database Systems', venue: 'Room 12', lecturer: 'Prof. Chukwu' },
    { time: '14:00', course: 'MTH202', title: 'Linear Algebra', venue: 'Room 8', lecturer: 'Dr. Okonkwo' },
  ];

  const announcements = [
    { id: 1, title: 'Mid-Semester Examination Schedule', date: 'Today', type: 'exam', priority: 'high' },
    { id: 2, title: 'Fee Payment Deadline Extended', date: 'Yesterday', type: 'finance', priority: 'high' },
    { id: 3, title: 'Library Opening Hours During Holiday', date: '2 days ago', type: 'general', priority: 'low' },
  ];

  const stats = [
    { label: 'Courses', value: '6', icon: '📚', color: 'text-blue-600' },
    { label: 'Credits', value: '18', icon: '🎯', color: 'text-purple-600' },
    { label: 'Attendance', value: '94%', icon: '✅', color: 'text-green-600' },
    { label: 'Rank', value: '#12', icon: '🏆', color: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left - Logo & Menu */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900">EduSaaS</span>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search courses, results, fees..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-100 border-0 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Right - User Menu */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Messages */}
            <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>

            {/* AI Assistant */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-shadow">
              <span>🤖</span>
              <span className="font-medium">AI Helper</span>
            </button>

            {/* Profile */}
            <button className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
                {student.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                <p className="text-xs text-slate-500">{student.matricNumber}</p>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 min-h-screen transition-all duration-300 sticky top-[73px] h-[calc(100vh-73px)]`}>
          <nav className="p-4 space-y-2">
            {[
              { icon: '🏠', label: 'Dashboard', active: true },
              { icon: '📚', label: 'My Courses', active: false },
              { icon: '📝', label: 'Results', active: false },
              { icon: '💳', label: 'Fees', active: false },
              { icon: '📅', label: 'Timetable', active: false },
              { icon: '📖', label: 'Library', active: false },
              { icon: '🏠', label: 'Hostel', active: false },
              { icon: '💬', label: 'Messages', active: false },
              { icon: '🔔', label: 'Announcements', active: false },
              { icon: '⚙️', label: 'Settings', active: false },
            ].map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  item.active 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Good morning, {student.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-500">Here's what's happening with your academics today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{stat.icon}</span>
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                </div>
                <p className="text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* GPA Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Current Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Academic Performance</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Excellent</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-4xl font-bold text-indigo-600 mb-1">{student.gpa}</p>
                  <p className="text-sm text-slate-500">Current GPA</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-4xl font-bold text-blue-600 mb-1">{student.cgpa}</p>
                  <p className="text-sm text-slate-500">Cumulative GPA</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Progress to First Class</span>
                  <span className="font-semibold text-slate-900">72%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button key={index} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white text-xl shadow-md group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <span className="text-xs font-medium text-slate-600">{action.label}</span>
                    {action.count && <span className="text-xs text-slate-400">{action.count}</span>}
                    {action.badge && <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">{action.badge}</span>}
                    {action.status && <span className="text-xs text-green-600">{action.status}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Classes & Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Classes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Today's Classes</h3>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">View All →</button>
              </div>
              <div className="space-y-4">
                {todayClasses.map((cls, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="w-16 h-16 bg-indigo-600 rounded-xl flex flex-col items-center justify-center text-white">
                      <span className="text-lg font-bold">{cls.time}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{cls.course}: {cls.title}</p>
                      <p className="text-sm text-slate-500">📍 {cls.venue} • 👤 {cls.lecturer}</p>
                    </div>
                    <button className="p-2 hover:bg-white rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Announcements</h3>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">View All →</button>
              </div>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      announcement.type === 'exam' ? 'bg-red-100 text-red-600' :
                      announcement.type === 'finance' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {announcement.type === 'exam' ? '📝' : announcement.type === 'finance' ? '💳' : '📢'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{announcement.title}</p>
                      <p className="text-sm text-slate-500 mt-1">{announcement.date}</p>
                    </div>
                    {announcement.priority === 'high' && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">Important</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommendation Section */}
          <div className="mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-xl font-bold">AI Academic Advisor</h3>
                </div>
                <p className="text-white/80 max-w-lg">
                  Based on your performance, I recommend reviewing "Data Structures" topics on Linked Lists before your test on Friday.
                </p>
                <button className="mt-4 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:shadow-lg transition-shadow">
                  Get Personalized Recommendations
                </button>
              </div>
              <div className="hidden lg:block text-8xl opacity-20">📊</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}