import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { asyncHandler } from '../api/axios.js'

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=f43f5e&color=fff&bold=true&size=128'

// UI preview companies for the Join Company dropdown design (replace with /company/search-companies API response)
const PREVIEW_COMPANIES = [
  {
    _id: 'preview-1',
    name: 'NexHire Technologies',
    industry: 'AI & Recruitment Tech',
    website: 'https://nexhire.ai',
    logo: '',
  },
  {
    _id: 'preview-2',
    name: 'Ardent Collaborations',
    industry: 'Software Engineering',
    website: 'https://ardentcollab.com',
    logo: '',
  },
  {
    _id: 'preview-3',
    name: 'Vertex Cloud Systems',
    industry: 'Cloud Infrastructure',
    website: 'https://vertexcloud.io',
    logo: '',
  },
  {
    _id: 'preview-4',
    name: 'Lumina Product Labs',
    industry: 'SaaS & Design',
    website: 'https://luminaprod.co',
    logo: '',
  },
]

function formatDate(dateString) {
  if (!dateString) return 'Not available'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function normalizeWebsiteUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

function getMembershipStatusBadge(status) {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200'
  }
}

export default function RecruiterProfile() {
  const navigate = useNavigate()
  const logoInputRef = useRef(null)

  const [currUser, setCurrUser] = useState(null)
  const [companyDetails, setCompanyDetails] = useState(null)
  const [companyExists, setCompanyExists] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  // Join Existing Company Search UI State
  const [showJoinSearch, setShowJoinSearch] = useState(false)
  const [companySearchQuery, setCompanySearchQuery] = useState('')
  const [companyList] = useState(PREVIEW_COMPANIES)

  useEffect(() => {
    let isMounted = true

    const loadRecruiterProfile = async () => {
      setLoading(true)
      setErrorMsg(null)

      try {
        await Promise.all([
          asyncHandler(async () => {
            const res = await api.get('/user/get-curr-user')
            if (isMounted && res?.data?.data) {
              setCurrUser(res.data.data.user || res.data.data)
            }
          }),
          asyncHandler(async () => {
            const res = await api.get('/company/my-company')
            if (isMounted) {
              const membership = res?.data?.data
              if (membership && membership.companyId) {
                setCompanyDetails(membership)
                setCompanyExists(true)
              } else {
                setCompanyDetails(null)
                setCompanyExists(false)
              }
            }
          }),
        ])
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load recruiter profile:', err)
          setErrorMsg(err?.response?.data?.message || 'Could not load profile details.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadRecruiterProfile()

    return () => {
      isMounted = false
    }
  }, [])

  // Redirect placeholder for Edit Account button (user will wire routing/page)
  const handleEditAccount = () => {
    // TODO: Redirect to Edit Account page
  }

  // Placeholder handlers for Create / Join Company actions (user will provide API calls)
  const handleCreateNewCompany = () => {
    // TODO: Open Create Company flow / redirect
  }

  const handleJoinCompanySelect = () => {
    // TODO: Wire POST /company/join/:companyId API call
  }

  const onUpdateCompanyLogo = async (e) => {
    const file = e.target.files?.[0]
    const companyId = companyDetails?.companyId?._id
    if (!file || !companyId) return

    try {
      const formData = new FormData()
      formData.append('logo', file)

      await asyncHandler(async () => {
        const res = await api.patch(`/company/logo/${companyId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        if (res?.data?.data) {
          setCompanyDetails((prev) =>
            prev ? { ...prev, companyId: res.data.data } : prev
          )
        }
      })
    } catch (err) {
      console.error('Failed to update logo:', err)
      setErrorMsg(err?.response?.data?.message || 'Failed to update company logo.')
    } finally {
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
    }
  }

  const onLeaveCompany = async () => {
    const companyId = companyDetails?.companyId?._id
    if (!companyId) return

    try {
      await asyncHandler(async () => {
        await api.delete(`/company/leave/${companyId}`)
        setCompanyDetails(null)
        setCompanyExists(false)
      })
    } catch (err) {
      console.error('Failed to leave company:', err)
      setErrorMsg(err?.response?.data?.message || 'Failed to leave company.')
    }
  }

  const company = companyDetails?.companyId || null

  const filteredCompanies = companyList.filter((item) =>
    item.name.toLowerCase().includes(companySearchQuery.trim().toLowerCase())
  )

  return (
    <main className="min-h-screen bg-[#fdeaea] px-4 sm:px-8 lg:px-12 py-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Top Breadcrumb & Navigation ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/recruiter/home" className="hover:text-rose-600 transition">
              Workspace
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-rose-600 font-semibold">Recruiter Profile</span>
          </div>

          <button
            onClick={() => navigate('/recruiter/home')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-[#f7d6d6] hover:bg-rose-50 hover:text-rose-600 transition shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-700 hover:text-rose-900 font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-2xl border border-[#f7d6d6] p-8 h-52" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-[#f7d6d6] h-64" />
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#f7d6d6] h-64" />
            </div>
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* USER IDENTITY & ACCOUNT DETAILS CARD (Always Visible)            */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <section className="bg-white rounded-2xl border border-[#f7d6d6] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  {/* User Avatar */}
                  <div className="w-20 h-20 rounded-2xl bg-[#fdeaea] border-2 border-[#f7d6d6] flex items-center justify-center shrink-0 overflow-hidden shadow-xs text-rose-600 font-extrabold text-2xl">
                    <img
                      src={
                        currUser?.avatar ||
                        `${DEFAULT_AVATAR}&name=${encodeURIComponent(currUser?.name || 'Recruiter')}`
                      }
                      alt={currUser?.name || 'Recruiter Avatar'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `${DEFAULT_AVATAR}&name=${encodeURIComponent(
                          currUser?.name || 'Recruiter'
                        )}`
                      }}
                    />
                  </div>

                  {/* User Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {currUser?.name || 'Recruiter'}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {currUser?.role || 'Recruiter'}
                      </span>
                      {currUser?.verified !== undefined && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            currUser.verified
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {currUser.verified ? 'Verified Account' : 'Unverified'}
                        </span>
                      )}
                    </div>

                    {companyExists && companyDetails?.designation && (
                      <p className="text-sm font-semibold text-slate-700">
                        {companyDetails.designation}
                        {company?.name ? ` at ${company.name}` : ''}
                      </p>
                    )}

                    {/* Meta Info Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {currUser?.email || 'Email not available'}
                      </span>

                      <span className="text-slate-300 hidden sm:inline">&bull;</span>

                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Joined {formatDate(currUser?.createdAt)}
                      </span>
                    </div>

                    {/* Edit Account Button directly under user details */}
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={handleEditAccount}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-xs cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit Account</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right-side Company Membership Quick Pill */}
                <div className="shrink-0">
                  {companyExists ? (
                    <div className="px-4 py-3 rounded-xl bg-[#fff9f9] border border-[#f7d6d6] text-left sm:text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Workspace Status
                      </span>
                      <span className="text-xs font-bold text-emerald-700 mt-0.5 inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Linked to {company?.name}
                      </span>
                    </div>
                  ) : (
                    <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-left sm:text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                        Workspace Status
                      </span>
                      <span className="text-xs font-bold text-amber-800 mt-0.5 inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        No Company Linked
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* CONDITIONAL SECTION: COMPANY EXISTS vs NO COMPANY                */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {companyExists && company ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column: Recruiter Membership Details */}
                <section className="bg-white rounded-2xl border border-[#f7d6d6] p-6 shadow-sm space-y-5">
                  <div className="border-b border-[#f7d6d6] pb-3.5">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Recruiter Details</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your role and standing inside the organization
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#fff9f9] border border-[#f7d6d6]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Designation
                      </span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                        {companyDetails?.designation || 'Recruiter'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#fff9f9] border border-[#f7d6d6] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Organization Role
                        </span>
                        <span className="text-sm font-bold text-slate-900 capitalize mt-0.5 block">
                          {companyDetails?.role || 'recruiter'}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold uppercase">
                        {companyDetails?.role || 'recruiter'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#fff9f9] border border-[#f7d6d6] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Membership Status
                        </span>
                        <span className="text-sm font-bold text-slate-900 capitalize mt-0.5 block">
                          {companyDetails?.status || 'active'}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase border ${getMembershipStatusBadge(
                          companyDetails?.status
                        )}`}
                      >
                        {companyDetails?.status || 'active'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#fff9f9] border border-[#f7d6d6]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Member Since
                      </span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                        {formatDate(companyDetails?.createdAt)}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Right Column: Company Details Card */}
                <section className="lg:col-span-2 bg-white rounded-2xl border border-[#f7d6d6] p-6 sm:p-7 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f7d6d6] pb-5">
                    <div className="flex items-center gap-4">
                      {/* Company Logo */}
                      <div className="w-16 h-16 rounded-2xl bg-[#fdeaea] border border-[#f7d6d6] flex items-center justify-center shrink-0 overflow-hidden text-rose-700 font-extrabold text-xl shadow-xs">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{company.name?.slice(0, 2)?.toUpperCase() || 'CO'}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                            {company.name}
                          </h2>
                          {company.industry && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                              {company.industry}
                            </span>
                          )}
                        </div>

                        {company.website && (
                          <a
                            href={normalizeWebsiteUrl(company.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 mt-1"
                          >
                            <span>{company.website}</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Company Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {companyDetails?.role === 'owner' && (
                        <>
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={onUpdateCompanyLogo}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="px-3.5 py-2 rounded-xl border border-[#f7d6d6] bg-[#fff9f9] hover:bg-rose-50 text-rose-600 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Update Logo</span>
                          </button>
                        </>
                      )}

                      {companyDetails?.role !== 'owner' && (
                        <button
                          type="button"
                          onClick={onLeaveCompany}
                          className="px-3.5 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold transition cursor-pointer"
                        >
                          Leave Company
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Company Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#fff9f9] border border-[#f7d6d6]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Industry
                      </span>
                      <span className="text-sm font-bold text-slate-900 mt-1 block">
                        {company.industry || 'Not specified'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#fff9f9] border border-[#f7d6d6]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Registered On NexHire
                      </span>
                      <span className="text-sm font-bold text-slate-900 mt-1 block">
                        {formatDate(company.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Company Description */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      About Company
                    </h3>
                    <div className="p-4 rounded-xl bg-[#fff9f9] border border-[#f7d6d6] text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {company.description || 'No company description provided yet.'}
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              /* ════════════════════════════════════════════════════════════════ */
              /* NO COMPANY ASSOCIATED VIEW                                      */
              /* ════════════════════════════════════════════════════════════════ */
              <section className="bg-white rounded-2xl border border-[#f7d6d6] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#fdeaea] border border-[#f7d6d6] text-rose-600 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                        Connect to a Company
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                        You are not currently linked to any company. Create a new company profile for your organization or join an existing company on NexHire.
                      </p>
                    </div>
                  </div>

                  {/* Two Options: Create a New Company / Join to an Existing Company */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={handleCreateNewCompany}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create a New Company</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowJoinSearch((prev) => !prev)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        showJoinSearch
                          ? 'bg-rose-100 border-rose-300 text-rose-800'
                          : 'bg-[#fdeaea] hover:bg-rose-100 border-[#f7d6d6] text-rose-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Join to an Existing Company</span>
                    </button>
                  </div>
                </div>

                {/* Small Search Input Bar + Dropdown (Appears on clicking Join to an Existing Company) */}
                {showJoinSearch && (
                  <div className="pt-5 border-t border-[#f7d6d6]">
                    <div className="max-w-lg space-y-2.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Find your company
                      </label>

                      {/* Small Search Input Bar */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={companySearchQuery}
                          onChange={(e) => setCompanySearchQuery(e.target.value)}
                          placeholder="Search company by name..."
                          className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-800 bg-[#fff9f9] border border-[#f7d6d6] rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition"
                        />
                        {companySearchQuery && (
                          <button
                            type="button"
                            onClick={() => setCompanySearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Clear search"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Small Dropdown of Matching Companies */}
                      <div className="bg-white border border-[#f7d6d6] rounded-xl shadow-md overflow-hidden">
                        <div className="px-3.5 py-2 bg-[#fff9f9] border-b border-[#f7d6d6] flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Matching Companies
                          </span>
                          <span className="text-[10px] font-bold text-rose-600">
                            {filteredCompanies.length} {filteredCompanies.length === 1 ? 'result' : 'results'}
                          </span>
                        </div>

                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                          {filteredCompanies.length === 0 ? (
                            <div className="px-4 py-6 text-center text-xs text-slate-400">
                              No companies found matching &quot;{companySearchQuery}&quot;
                            </div>
                          ) : (
                            filteredCompanies.map((item) => (
                              <div
                                key={item._id}
                                className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-rose-50/40 transition"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 rounded-lg bg-[#fdeaea] border border-[#f7d6d6] text-rose-700 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                                    {item.logo ? (
                                      <img
                                        src={item.logo}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span>{item.name.slice(0, 2).toUpperCase()}</span>
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 truncate">
                                      {item.name}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 truncate">
                                      {item.industry || 'Organization'}
                                      {item.website ? ` • ${item.website}` : ''}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleJoinCompanySelect(item)}
                                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition shrink-0 cursor-pointer"
                                >
                                  Join
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
