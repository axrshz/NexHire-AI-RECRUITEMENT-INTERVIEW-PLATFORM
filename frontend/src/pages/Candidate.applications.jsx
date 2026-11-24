import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { asyncHandler } from '../api/axios.js';

export default function CandidateApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [withdrawingId, setWithdrawingId] = useState(null);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      await asyncHandler(async () => {
        const res = await api.get('/job/user-applications');
        if (res?.data?.data) {
          setApplications(res.data.data);
        }
      });
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchApplications();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleWithdraw = async (jobId, applicationId) => {
    if (!jobId || withdrawingId) return;
    const confirmWithdraw = window.confirm('Are you sure you want to withdraw this application?');
    if (!confirmWithdraw) return;

    setWithdrawingId(applicationId);
    try {
      await asyncHandler(async () => {
        await api.post(`/job/apply/${jobId}`);
        setApplications((prev) => prev.filter((app) => app._id !== applicationId));
      });
    } catch (err) {
      console.error('Failed to withdraw application:', err);
      alert(err.response?.data?.message || 'Could not withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const norm = (status || 'Due').toLowerCase();
    if (norm === 'accepted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Accepted
        </span>
      );
    }
    if (norm === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Declined
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Under Review
      </span>
    );
  };

  const filteredApplications = applications.filter((app) => {
    const rawStatus = (app.status || 'Due').toLowerCase();
    const mappedFilter = filterStatus.toLowerCase();

    if (mappedFilter === 'under review' && rawStatus !== 'due') return false;
    if (mappedFilter === 'accepted' && rawStatus !== 'accepted') return false;
    if (mappedFilter === 'declined' && rawStatus !== 'rejected') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const jobTitle = (app.jobId?.title || '').toLowerCase();
      const compName = (app.companyId?.name || '').toLowerCase();
      const loc = (app.jobId?.location || '').toLowerCase();
      return jobTitle.includes(q) || compName.includes(q) || loc.includes(q);
    }
    return true;
  });

  const stats = {
    total: applications.length,
    underReview: applications.filter((a) => (a.status || 'Due').toLowerCase() === 'due').length,
    accepted: applications.filter((a) => (a.status || '').toLowerCase() === 'accepted').length,
    declined: applications.filter((a) => (a.status || '').toLowerCase() === 'rejected').length,
  };

  return (
    <main className="flex-1 min-w-0 px-6 sm:px-10 py-8 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/candidate/home" className="hover:text-rose-600 transition">Workspace</Link>
          <span className="text-slate-400">/</span>
          <span className="text-rose-600 font-semibold">My Applications</span>
        </div>

        <button
          onClick={() => navigate('/candidate/home')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-[#f7d6d6] hover:bg-[#fdeaea] hover:text-rose-600 transition shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Explore More Jobs</span>
        </button>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#f7d6d6] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Application Pipeline</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Track Your Job Submissions
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
            Monitor real-time application updates, employer reviews, and interview invites all in one place.
          </p>
        </div>

        {/* Quick status summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white px-3.5 py-2 rounded-xl border border-[#f7d6d6] text-xs font-semibold shadow-xs">
            <span className="text-slate-500 mr-1.5">Submitted:</span>
            <span className="text-slate-900 font-bold">{stats.total}</span>
          </div>
          <div className="bg-white px-3.5 py-2 rounded-xl border border-amber-200 text-xs font-semibold shadow-xs">
            <span className="text-amber-600 mr-1.5">In Review:</span>
            <span className="text-amber-800 font-bold">{stats.underReview}</span>
          </div>
          <div className="bg-white px-3.5 py-2 rounded-xl border border-emerald-200 text-xs font-semibold shadow-xs">
            <span className="text-emerald-600 mr-1.5">Accepted:</span>
            <span className="text-emerald-800 font-bold">{stats.accepted}</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#f7d6d6] shadow-xs w-full sm:w-auto overflow-x-auto">
          {['All', 'Under Review', 'Accepted', 'Declined'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                filterStatus === tab
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#fdeaea]/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role, company, location..."
            className="w-full pl-9 pr-3 py-2 bg-white text-xs border border-[#f7d6d6] rounded-xl outline-none focus:border-rose-400 text-slate-800 placeholder-slate-400 transition"
          />
        </div>
      </div>

      {/* Applications List / Table Card */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#f7d6d6] p-8 space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-rose-100 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#fdeaea]/50 rounded-xl border border-[#f7d6d6]" />
            ))}
          </div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#f7d6d6] p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fdeaea] border border-[#f7d6d6] flex items-center justify-center text-rose-600 mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            {searchQuery || filterStatus !== 'All' ? 'No matching applications found' : 'No applications submitted yet'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || filterStatus !== 'All'
              ? 'Try modifying your search or switching filters.'
              : 'Explore open roles on the job feed and apply with your profile.'}
          </p>
          <button
            onClick={() => {
              if (searchQuery || filterStatus !== 'All') {
                setSearchQuery('');
                setFilterStatus('All');
              } else {
                navigate('/candidate/home');
              }
            }}
            className="mt-4 px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs cursor-pointer"
          >
            {searchQuery || filterStatus !== 'All' ? 'Clear Filters' : 'Browse Open Roles'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#f7d6d6] shadow-xs overflow-hidden">
          {/* Header row for desktop */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3.5 bg-[#fdeaea]/50 border-b border-[#f7d6d6] text-[11px] font-bold text-slate-500 uppercase tracking-wider items-center">
            <div className="col-span-5">Company & Role</div>
            <div className="col-span-3">Applied Date & Method</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* List items */}
          <div className="divide-y divide-[#f7d6d6]/60">
            {filteredApplications.map((app) => {
              const job = app.jobId || {};
              const company = app.companyId || {};
              const isWithdrawing = withdrawingId === app._id;

              return (
                <div
                  key={app._id}
                  className="p-5 md:px-6 md:py-4.5 hover:bg-[#fdeaea]/20 transition-colors duration-150 flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center"
                >
                  {/* Role & Company info */}
                  <div className="col-span-5 flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[#fdeaea] border border-[#f7d6d6] flex items-center justify-center shrink-0 overflow-hidden">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name || 'Company'} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2
                        onClick={() => job._id && navigate(`/candidate/job/${job._id}`)}
                        className="font-bold text-sm text-slate-900 hover:text-rose-600 cursor-pointer truncate transition leading-snug"
                        title={job.title}
                      >
                        {job.title || 'Role Title'}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
                        <span className="font-semibold text-slate-700 truncate">{company.name || 'Company'}</span>
                        {job.location && (
                          <>
                            <span>•</span>
                            <span className="truncate">{job.location}</span>
                          </>
                        )}
                      </div>
                      {job.salary && (
                        <div className="mt-1">
                          <span className="inline-block text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {job.salary}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates & Method */}
                  <div className="col-span-3 text-xs text-slate-600 space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">Applied {formatDate(app.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {job.method && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                          {job.method}
                        </span>
                      )}
                      {job.type && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                          {job.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-2 flex items-center">
                    {getStatusBadge(app.status)}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => job._id && navigate(`/candidate/job/${job._id}`)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-[#f7d6d6] hover:bg-[#fdeaea] hover:text-rose-600 transition shadow-xs cursor-pointer"
                    >
                      View Role
                    </button>
                    <button
                      onClick={() => handleWithdraw(job._id, app._id)}
                      disabled={isWithdrawing}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition cursor-pointer"
                      title="Withdraw application"
                    >
                      {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
