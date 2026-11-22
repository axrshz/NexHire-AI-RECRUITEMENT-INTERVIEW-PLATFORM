import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from "../api/axios.js"
import asyncHandler from '../../../backend/src/utils/asyncHandler.js'

export default function RecruiterHome() {
  const navigate = useNavigate()
  const [currUser, setCurrUser] = useState({})

  const [activeTab, setActiveTab] = useState('candidates')

  useEffect(() => {
    asyncHandler(async function () {
      api.get("/user/get-curr-user")
        .then((res) => {
          setCurrUser(res.data.data.user)
        })
    })
  }, [])

  const handleLogout = () => {

    navigate('/login')
  }

  const stats = [
    { label: 'Active Job Openings', value: '8', change: '+2 this week', icon: 'briefcase' },
    { label: 'Total Candidates', value: '142', change: '+24 new', icon: 'users' },
    { label: 'AI Interviews Held', value: '56', change: '89% completion rate', icon: 'cpu' },
    { label: 'Shortlisted for Round 2', value: '19', change: 'Top 15 percentile', icon: 'sparkles' },
  ]

  const candidates = [
    {
      id: 1,
      name: 'Aarav Sharma',
      role: 'Full Stack Engineer (MERN)',
      aiScore: '94%',
      status: 'AI Interview Passed',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      experience: '3 yrs exp',
      location: 'Bengaluru, India',
    },
    {
      id: 2,
      name: 'Riya Sengupta',
      role: 'Frontend Developer (React)',
      aiScore: '91%',
      status: 'Review Pending',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      experience: '2 yrs exp',
      location: 'Kolkata, India',
    },
    {
      id: 3,
      name: 'Devansh Verma',
      role: 'Backend Systems Engineer (Node/Go)',
      aiScore: '88%',
      status: 'Shortlisted',
      statusColor: 'bg-rose-50 text-rose-700 border-rose-200',
      experience: '4 yrs exp',
      location: 'Remote',
    },
    {
      id: 4,
      name: 'Ananya Roy',
      role: 'UI/UX & Product Engineer',
      aiScore: '85%',
      status: 'Interview Scheduled',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      experience: '3 yrs exp',
      location: 'Hyderabad, India',
    },
  ]

  return (
    <div className="min-h-screen bg-[#fdeaea]">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-[#f7d6d6] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">NexHire</span>
              <span className="text-[10px] block font-semibold uppercase tracking-wider text-rose-600 -mt-0.5">Recruiter Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 font-bold text-xs uppercase overflow-hidden">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name?.slice(0, 2) || 'RC'
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800">{currentUser?.name || 'Recruiter'}</p>
                <p className="text-[10px] text-slate-500">{currentUser?.email || 'recruiter@nexhire.com'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-rose-600 hover:border-rose-300 transition cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-rose-600 text-xs font-bold tracking-wide uppercase mb-1">
              <span>Talent Intelligence Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'Recruiter'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage your job pipelines, AI interview screenings, and shortlisted applicants.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Post New Requisition</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-[#f7d6d6] shadow-xs">
              <span className="text-xs font-medium text-slate-500 block mb-1">{item.label}</span>
              <div className="text-2xl font-extrabold text-slate-900 mb-1">{item.value}</div>
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                {item.change}
              </span>
            </div>
          ))}
        </div>

        {/* Pipeline & Candidates Board */}
        <div className="bg-white rounded-2xl border border-[#f7d6d6] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#f7d6d6] flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Candidate Pipeline & AI Scoring</h2>
              <p className="text-xs text-slate-500 mt-0.5">Top qualified candidates ranked by AI interview performance</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('candidates')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${activeTab === 'candidates'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                All Candidates
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${activeTab === 'jobs'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                Active Jobs
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-rose-50/30 transition">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                    {candidate.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{candidate.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${candidate.statusColor}`}>
                        {candidate.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{candidate.role} • {candidate.experience} • {candidate.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">AI Match Score</span>
                    <span className="text-sm font-extrabold text-rose-600">{candidate.aiScore}</span>
                  </div>

                  <button className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer transition">
                    View Dossier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
