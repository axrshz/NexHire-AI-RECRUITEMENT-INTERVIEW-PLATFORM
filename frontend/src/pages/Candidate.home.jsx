import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from "../api/axios.js";
import { asyncHandler } from "../api/axios.js";

export default function CandidateHome() {
  const [activeTab, setActiveTab] = useState("Foryou");
  const [inputValue, setInputValue] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    asyncHandler(async () => {
      try {
        setLoading(true);
        const res = await api.get("/job/feed");
        if (res?.data?.data) {
          setJobs(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch jobs feed:", err);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredJobs = jobs.filter((job) => {
    // Tab filter
    if (activeTab === "Internships" && job.type !== "Internship") return false;
    if (activeTab === "Remote" && job.method !== "Remote") return false;
    if (activeTab === "Entry-level") {
      const exp = (job.experience || "").toLowerCase();
      if (!exp.includes("0") && !exp.includes("1") && !exp.includes("entry") && !exp.includes("fresher")) {
        return false;
      }
    }

    // Search query filter
    if (inputValue.trim()) {
      const query = inputValue.toLowerCase().trim();
      const titleMatch = job.title?.toLowerCase().includes(query);
      const companyMatch = (
        job.postedBy?.details?.company?.name ||
        job.postedBy?.name ||
        ""
      ).toLowerCase().includes(query);
      const descMatch = job.description?.toLowerCase().includes(query);
      const skillMatch = job.requiredSkills?.some((s) => s.toLowerCase().includes(query));
      const locationMatch = job.location?.toLowerCase().includes(query);
      return titleMatch || companyMatch || descMatch || skillMatch || locationMatch;
    }

    return true;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    return (b.vacancies || 0) - (a.vacancies || 0);
  });

  return (
    <main className="px-10 py-8 max-w-5xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center text-xs text-slate-500 mb-4">
        <div className="flex items-center gap-2">
          <span>Workspace</span>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-slate-800">Job Feed</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-rose-600 text-xs font-bold tracking-wide uppercase mb-2">
          <span>Let's find your next chapter</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Big ambitions. Real opportunities.
        </h1>
        <p className="text-slate-600 text-sm mt-2 max-w-2xl">
          Discover roles that fit your skills, interests, and what comes next. AI-powered matching surfaces the most relevant opportunities.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4 mb-8">
        {/* Search Input Bar */}
        <div className="bg-white p-2 rounded-2xl border border-[#f7d6d6] shadow-sm hover:border-rose-300 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 transition-all flex items-center gap-3">
          <div className="pl-3 text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Job title, company, skills, or location..."
            className="w-full text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
          />
          {inputValue && (
            <button
              onClick={() => setInputValue("")}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition shrink-0 cursor-pointer">
            Find jobs
          </button>
        </div>

        {/* Filter Chips & Sort */}
        <div>
          <div className="mb-2">
            <h2 className="text-base font-bold text-slate-900">Find your fit</h2>
            <p className="text-xs text-slate-500">Curated for your next big move</p>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "Foryou", label: "For you" },
                { id: "Internships", label: "Internships" },
                { id: "Entry-level", label: "Entry-level" },
                { id: "Remote", label: "Remote" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    activeTab === tab.id
                      ? "px-4 py-1.5 rounded-lg bg-rose-600 text-white font-medium text-xs shadow-sm cursor-pointer transition"
                      : "px-4 py-1.5 rounded-lg bg-white hover:bg-[#fdeaea]/70 border border-[#f7d6d6] text-slate-700 font-medium text-xs transition cursor-pointer"
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Sorted by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="vacancies">Most Vacancies</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Job Cards Feed */}
      <div className="space-y-4">
        {loading ? (
          /* Loading State */
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 mb-3 animate-spin">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">Loading latest opportunities...</p>
          </div>
        ) : sortedJobs.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-[#f7d6d6] p-12 text-center shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-3">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 text-base">No jobs found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {inputValue || activeTab !== "Foryou"
                ? "No roles match your current search and filters. Try clearing your search or switching categories."
                : "No jobs have been posted yet. Check back soon for new openings!"}
            </p>
            {(inputValue || activeTab !== "Foryou") && (
              <button
                onClick={() => {
                  setInputValue("");
                  setActiveTab("Foryou");
                }}
                className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          /* Dynamic Job Cards */
          sortedJobs.map((job) => {
            const companyName =
              job.postedBy?.details?.company?.name ||
              job.postedBy?.name ||
              "NexHire Partner";

            const companyLogo =
              job.postedBy?.details?.company?.logo ||
              job.postedBy?.avatar;

            return (
              <div
                key={job._id}
                className="bg-white rounded-2xl border border-[#f7d6d6] hover:border-rose-300 p-6 shadow-sm hover:shadow-md transition-all duration-150 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Company Logo or Icon */}
                    <div className="w-12 h-12 rounded-xl bg-[#fdeaea] border border-[#f7d6d6] flex items-center justify-center shrink-0 overflow-hidden">
                      {companyLogo ? (
                        <img
                          src={companyLogo}
                          alt={companyName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-rose-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-medium text-slate-700">{companyName}</span>
                        <span>•</span>
                        <span>
                          {job.method} · {job.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {job.status === "Open" && (
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{job.vacancies ? `${job.vacancies} open` : "Open"}</span>
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-3.5 leading-relaxed line-clamp-2">
                  {job.description}
                </p>

                {/* Job Tags & Skills */}
                <div className="flex items-center gap-2 flex-wrap mt-3.5">
                  {job.type && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                      {job.type}
                    </span>
                  )}
                  {job.experience && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                      {job.experience} exp
                    </span>
                  )}
                  {job.requiredSkills?.map((skill, i) => (
                    <span
                      key={`${job._id}-${skill}-${i}`}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <div className="font-bold text-slate-900 text-sm">
                    {job.salary && job.salary !== "unpaid" ? job.salary : "Unpaid / Competitive"}
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-400">{formatTimeAgo(job.createdAt)}</span>
                    <button
                      onClick={() => alert(`Job: ${job.title} at ${companyName}`)}
                      className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View details</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
