import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { asyncHandler } from '../api/axios.js'

function CandidateJob() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [job, setJob] = useState({})
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [candidate, setCandidate] = useState({})
    const [applied, setApplied] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)

    // Fetch job details on mount & handle token refresh automatically on reload
    useEffect(() => {
        let isMounted = true

        const fetchJob = async () => {
            setLoading(true)
            setErrorMsg(null)
            try {
                await asyncHandler(async () => {
                    const res = await api.get(`/job/job-details/${id}`)
                    if (isMounted && res?.data?.data) {
                        setJob(res.data.data)
                        setApplied(Boolean(res.data.data.isApplied))
                    }
                })
            } catch (err) {
                if (isMounted) {
                    console.error("Failed to load job details:", err)
                    setErrorMsg(err.response?.data?.message || "Failed to load job details")
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        if (id) {
            fetchJob()
        }

        return () => {
            isMounted = false
        }
    }, [id])

    // Apply / Unapply toggle with instant state update
    const onApply = () => {
        if (actionLoading || loading) return

        setApplied((prev) => !prev)
        setActionLoading(true)
        asyncHandler(async () => {
            try {
                const res = await api.post(`/job/apply/${id}`)
                if (res?.data?.data?.isApplied !== undefined) {
                    setApplied(Boolean(res.data.data.isApplied))
                }
            } catch (err) {
                setApplied((prev) => !prev)
                const message = err.response?.data?.message || err.message || "Failed to update application status"
                console.error("Application toggle failed:", message)
                alert(message)
            } finally {
                setActionLoading(false)
            }
        })
    }

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Recently'
        const diff = Date.now() - new Date(dateString).getTime()
        const minutes = Math.floor(diff / (1000 * 60))
        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        if (days === 1) return '1 day ago'
        return `${days} days ago`
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified'
        const d = new Date(dateString)
        if (isNaN(d.getTime())) return 'Not specified'
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const recruiter = job?.postedBy || {}
    const companyName = recruiter.companyName || 'NexHire Partner'
    const companyLogo = recruiter.companyLogo || recruiter.avatar

    return (
        <main className="min-h-screen bg-[#fdeaea] px-4 sm:px-6 lg:px-10 py-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Top Navigation & Breadcrumbs */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-[#f7d6d6] hover:bg-[#fdeaea] hover:text-rose-600 transition shadow-xs cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Jobs</span>
                    </button>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <button
                            onClick={() => navigate('/candidate/home')}
                            className="hover:text-rose-600 transition cursor-pointer"
                        >
                            Job Feed
                        </button>
                        <span className="text-slate-400">/</span>
                        <span className="text-rose-600 font-semibold truncate max-w-[200px] sm:max-w-xs">
                            {job?.title || 'Job Details'}
                        </span>
                    </div>
                </div>

                {/* Error Banner if fetch failed */}
                {errorMsg && !job?.title && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center justify-between">
                        <span>{errorMsg}</span>
                        <button
                            onClick={() => window.location.reload()}
                            className="font-bold underline hover:text-red-900 cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && !job?.title ? (
                    <div className="space-y-6 animate-pulse">
                        <div className="bg-white rounded-2xl border border-[#f7d6d6] p-8 h-64" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-2xl border border-[#f7d6d6] p-8 h-48" />
                                <div className="bg-white rounded-2xl border border-[#f7d6d6] p-8 h-36" />
                            </div>
                            <div className="bg-white rounded-2xl border border-[#f7d6d6] p-8 h-80" />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                        {/* LEFT COLUMN: Main Job Details */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Job Header Card */}
                            <div className="bg-white rounded-2xl border border-[#f7d6d6] p-6 sm:p-8 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-[#fdeaea] border border-[#f7d6d6] flex items-center justify-center shrink-0 overflow-hidden">
                                            {companyLogo ? (
                                                <img
                                                    src={companyLogo}
                                                    alt={companyName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                                {job?.title || 'Job Title'}
                                            </h1>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5">
                                                <span className="font-semibold text-slate-700">{companyName}</span>
                                                {job?.location && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            {job.location}
                                                        </span>
                                                    </>
                                                )}
                                                {job?.createdAt && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Posted {formatTimeAgo(job.createdAt)}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Application & Job Status Badges */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {applied && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>Applied</span>
                                            </span>
                                        )}

                                        {job?.status && (
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                                job.status === 'Open'
                                                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                                                    : 'bg-slate-100 border-slate-200 text-slate-600'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'Open' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                <span>{job.status}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Key Highlights Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
                                    <div className="bg-[#fdeaea]/60 rounded-xl p-3 border border-[#f7d6d6]/60">
                                        <span className="text-[11px] font-medium text-slate-500 block">Salary</span>
                                        <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">
                                            {job?.salary || 'Competitive'}
                                        </span>
                                    </div>
                                    <div className="bg-[#fdeaea]/60 rounded-xl p-3 border border-[#f7d6d6]/60">
                                        <span className="text-[11px] font-medium text-slate-500 block">Job Type</span>
                                        <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">
                                            {job?.type || 'Full-time'}
                                        </span>
                                    </div>
                                    <div className="bg-[#fdeaea]/60 rounded-xl p-3 border border-[#f7d6d6]/60">
                                        <span className="text-[11px] font-medium text-slate-500 block">Work Method</span>
                                        <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">
                                            {job?.method || 'On-site'}
                                        </span>
                                    </div>
                                    <div className="bg-[#fdeaea]/60 rounded-xl p-3 border border-[#f7d6d6]/60">
                                        <span className="text-[11px] font-medium text-slate-500 block">Experience</span>
                                        <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">
                                            {job?.experience || 'Any'}
                                        </span>
                                    </div>
                                </div>

                                {/* Apply / Unapply Action Bar in Header */}
                                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        {job?.vacancies !== undefined && (
                                            <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                                                {job.vacancies} {job.vacancies === 1 ? 'Opening' : 'Openings'}
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-400">
                                            Updated {formatDate(job?.updatedAt)}
                                        </span>
                                    </div>

                                    {/* Action Button: Unapply or Apply */}
                                    <button
                                        onClick={onApply}
                                        disabled={actionLoading}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-xs active:scale-95 ${
                                            applied
                                                ? 'border border-rose-300 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-400'
                                                : 'bg-rose-600 hover:bg-rose-700 text-white'
                                        }`}
                                    >
                                        {actionLoading ? (
                                            <>
                                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                </svg>
                                                <span>{applied ? 'Unapplying...' : 'Applying...'}</span>
                                            </>
                                        ) : applied ? (
                                            <>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                <span>Unapply</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Apply for Role</span>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Job Description */}
                            <div className="bg-white rounded-2xl border border-[#f7d6d6] p-6 sm:p-8 shadow-sm">
                                <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>About the Position</span>
                                </h2>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                    {job?.description || 'No detailed description provided for this job.'}
                                </p>
                            </div>

                            {/* Required Skills */}
                            {job?.requiredSkills && job.requiredSkills.length > 0 && (
                                <div className="bg-white rounded-2xl border border-[#f7d6d6] p-6 sm:p-8 shadow-sm">
                                    <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <span>Required Skills</span>
                                    </h2>
                                    <p className="text-xs text-slate-500 mb-4">
                                        Candidates with experience in these key technologies are preferred.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {job.requiredSkills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3.5 py-1.5 rounded-xl bg-[#fdeaea] border border-[#f7d6d6] text-rose-700 font-semibold text-xs transition hover:bg-rose-100"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Bottom Application Call-to-Action Card */}
                            <div className="bg-white rounded-2xl border border-[#f7d6d6] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-slate-900">
                                            {applied ? 'Application Active' : 'Ready to take the next step?'}
                                        </h3>
                                        {applied && (
                                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                                                Applied
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {applied
                                            ? 'You have already applied for this role. If you want to withdraw your submission, click Unapply.'
                                            : 'Click the button to submit your candidate profile directly to the hiring team.'}
                                    </p>
                                </div>
                                <button
                                    onClick={onApply}
                                    disabled={actionLoading}
                                    className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer shrink-0 flex items-center gap-2 shadow-xs active:scale-95 ${
                                        applied
                                            ? 'border border-rose-300 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-400'
                                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                                    }`}
                                >
                                    {actionLoading ? (
                                        <>
                                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                            <span>{applied ? 'Unapplying...' : 'Applying...'}</span>
                                        </>
                                    ) : applied ? (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            <span>Unapply</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Apply Now</span>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Recruiter & Company Sidebar */}
                        <div className="space-y-6">

                            {/* Company Card */}
                            <div className="bg-white rounded-2xl border border-[#f7d6d6] p-6 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                                    Company Overview
                                </h3>
                                <div className="flex items-center gap-3.5 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#fdeaea] border border-[#f7d6d6] flex items-center justify-center shrink-0 overflow-hidden">
                                        {companyLogo ? (
                                            <img
                                                src={companyLogo}
                                                alt={companyName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-slate-900 text-sm truncate">
                                            {companyName}
                                        </h4>
                                        <p className="text-xs text-slate-500 truncate">
                                            NexHire Partner
                                        </p>
                                    </div>
                                </div>

                                {recruiter.companyWebsite && (
                                    <a
                                        href={recruiter.companyWebsite}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-[#fdeaea] border border-[#f7d6d6] hover:bg-rose-100 transition"
                                    >
                                        <span>Visit Company Website</span>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}
                            </div>

                            {/* Recruiter Card */}
                            <div className="bg-white rounded-2xl border border-[#f7d6d6] p-6 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                                    Posted By
                                </h3>
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-full bg-[#fdeaea] border border-[#f7d6d6] flex items-center justify-center shrink-0 overflow-hidden text-rose-600 font-bold text-base">
                                        {recruiter.avatar ? (
                                            <img
                                                src={recruiter.avatar}
                                                alt={recruiter.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>
                                                {recruiter.name ? recruiter.name.charAt(0).toUpperCase() : 'R'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-slate-900 text-sm truncate">
                                            {recruiter.name || 'Hiring Lead'}
                                        </h4>
                                        <p className="text-xs text-slate-500 truncate">
                                            {recruiter.designation || 'Lead Recruiter'}
                                        </p>
                                        {recruiter.role && (
                                            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
                                                {recruiter.role}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Summary Card */}
                            <div className="bg-white rounded-2xl border border-[#f7d6d6] p-6 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                                    Job Summary
                                </h3>
                                <div className="space-y-3 text-xs">
                                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Method</span>
                                        <span className="font-semibold text-slate-800">{job?.method || 'Not specified'}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Employment</span>
                                        <span className="font-semibold text-slate-800">{job?.type || 'Not specified'}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Vacancies</span>
                                        <span className="font-semibold text-slate-800">{job?.vacancies !== undefined ? job.vacancies : '1'} open</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-500">Experience</span>
                                        <span className="font-semibold text-slate-800">{job?.experience || 'Any'}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-slate-500">Posted on</span>
                                        <span className="font-semibold text-slate-800">{formatDate(job?.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                )}

            </div>
        </main>
    )
}

export default CandidateJob