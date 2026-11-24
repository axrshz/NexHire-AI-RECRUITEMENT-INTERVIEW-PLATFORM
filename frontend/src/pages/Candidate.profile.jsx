import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { asyncHandler } from '../api/axios.js';

const DUMMY_INTERVIEWS = [
  {
    _id: 'mock-1',
    title: 'FullStack Developer Assessment',
    mode: 'recruitment',
    company: 'Ardent Collaborations',
    interviewType: 'System Design & React',
    difficulty: 'Intermediate',
    duration: '45 mins',
    status: 'Completed',
    date: 'Nov 22, 2026',
    overallScore: 88,
    verdict: 'Recommended',
  },
  {
    _id: 'mock-2',
    title: 'Frontend Architecture Mock',
    mode: 'practice',
    company: 'NexHire AI Prep',
    interviewType: 'Technical Mock',
    difficulty: 'Advanced',
    duration: '30 mins',
    status: 'Completed',
    date: 'Nov 19, 2026',
    overallScore: 92,
    verdict: 'Excellent',
  },
  {
    _id: 'mock-3',
    title: 'Behavioral & Leadership Readiness',
    mode: 'practice',
    company: 'NexHire AI Prep',
    interviewType: 'Behavioral Fit',
    difficulty: 'Intermediate',
    duration: '25 mins',
    status: 'Completed',
    date: 'Nov 15, 2026',
    overallScore: 85,
    verdict: 'Qualified',
  },
];

function CandidateProfile() {
  const navigate = useNavigate();
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [user, setUser] = useState({});
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalApplicationsAccepted, setTotalApplicationsAccepted] = useState(0);
  const [totalApplicationsRejected, setTotalApplicationsRejected] = useState(0);
  const [totalApplicationsDue, setTotalApplicationsDue] = useState(0);
  const [interviewsAttended, setInterviewsAttended] = useState(DUMMY_INTERVIEWS.length);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Edit / Setup Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [preferredRole, setPreferredRole] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [skillsList, setSkillsList] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);

  const fetchApplications = async () => {
    try {
      await asyncHandler(async () => {
        const res = await api.get('/job/user-applications');
        if (res?.data?.data) {
          const apps = res.data.data;
          setTotalApplications(apps.length);
          setTotalApplicationsAccepted(apps.filter((app) => app.status === 'Accepted').length);
          setTotalApplicationsRejected(apps.filter((app) => app.status === 'Rejected').length);
          setTotalApplicationsDue(apps.filter((app) => app.status === 'Due' || !app.status).length);
        }
      });
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  };

  const fetchCandidateDetails = async () => {
    try {
      await asyncHandler(async () => {
        const res = await api.get('/candidate/get-profile');
        if (res?.data?.data) {
          const profile = res.data.data;
          setCandidateDetails(profile);
          setFullName(profile.fullName || '');
          setPreferredRole(profile.preferredRole || '');
          setEducation(profile.education || '');
          setExperience(profile.experience || '');
          setSkillsList(profile.skills || []);
        } else {
          setCandidateDetails(null);
        }
      });
    } catch (err) {
      console.error('Failed to load candidate details:', err);
    }
  };

  const fetchUser = async () => {
    try {
      await asyncHandler(async () => {
        const res = await api.get('/user/get-curr-user');
        if (res?.data?.data?.user) {
          setUser(res.data.data.user);
          if (!fullName && res.data.data.user.name) {
            setFullName(res.data.data.user.name);
          }
        }
      });
    } catch (err) {
      console.error('Failed to load current user:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([fetchUser(), fetchApplications(), fetchCandidateDetails()])
      .catch((error) => {
        if (isMounted) setErr(error.message || 'Failed to load profile details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenEdit = () => {
    if (candidateDetails) {
      setFullName(candidateDetails.fullName || user.name || '');
      setPreferredRole(candidateDetails.preferredRole || '');
      setEducation(candidateDetails.education || '');
      setExperience(candidateDetails.experience || '');
      setSkillsList(candidateDetails.skills || []);
    } else {
      setFullName(user.name || '');
      setPreferredRole('');
      setEducation('');
      setExperience('');
      setSkillsList([]);
    }
    setResumeFile(null);
    setFormErr(null);
    setFormSuccess(false);
    setIsEditing(true);
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillsInput.trim().replace(/^,|,$/g, '');
      if (val && !skillsList.includes(val)) {
        setSkillsList([...skillsList, val]);
        setSkillsInput('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormErr('Full name is required');
      return;
    }

    setSaving(true);
    setFormErr(null);

    const formData = new FormData();
    formData.append('fullName', fullName.trim());
    formData.append('preferredRole', preferredRole.trim());
    formData.append('education', education.trim());
    formData.append('experience', experience.trim());
    formData.append('skills', JSON.stringify(skillsList));

    if (resumeFile) {
      formData.append('resume', resumeFile);
    }

    try {
      await asyncHandler(async () => {
        const endpoint = candidateDetails ? '/candidate/update-profile' : '/candidate/set-profile';
        const method = candidateDetails ? 'patch' : 'post';
        const res = await api[method](endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (res?.data?.data) {
          setCandidateDetails(res.data.data);
          setFormSuccess(true);
          setTimeout(() => {
            setIsEditing(false);
            setFormSuccess(false);
          }, 600);
        }
      });
    } catch (err) {
      console.error('Failed to save profile:', err);
      setFormErr(err.response?.data?.message || err.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fdeaea] px-4 sm:px-8 lg:px-12 py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/candidate/home" className="hover:text-rose-600 transition">
              Workspace
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-rose-600 font-semibold">Candidate Profile</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/candidate/home')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-[#f7d6d6] hover:bg-[#fdeaea] hover:text-rose-600 transition shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Feed</span>
            </button>

            <button
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 transition shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>{candidateDetails ? 'Edit Profile' : 'Complete Profile'}</span>
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-2xl border border-[#f7d6d6] p-8 h-48" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#f7d6d6] h-24" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#f7d6d6] h-80" />
              <div className="bg-white rounded-2xl border border-[#f7d6d6] h-80" />
            </div>
          </div>
        ) : (
          <>
            {/* Header Identity Card */}
            <div className="bg-white rounded-2xl border border-[#f7d6d6] p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-[#fdeaea] border-2 border-[#f7d6d6] flex items-center justify-center shrink-0 overflow-hidden shadow-xs text-rose-600 font-extrabold text-2xl">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(candidateDetails?.fullName || user?.name || 'C').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {candidateDetails?.fullName || user?.name || 'Candidate Name'}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {user?.role || 'Candidate'}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {candidateDetails?.preferredRole || 'Role not specified'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {user?.email || 'email@example.com'}
                      </span>
                      {candidateDetails?.education && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                            {candidateDetails.education}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resume Status Button */}
                <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto">
                  {candidateDetails?.resumeUrl ? (
                    <a
                      href={candidateDetails.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-[#fdeaea] border border-[#f7d6d6] hover:bg-rose-100 transition shadow-xs"
                    >
                      <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>View Resume</span>
                      <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <button
                      onClick={handleOpenEdit}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition shadow-xs"
                    >
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Upload Resume</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="bg-white rounded-2xl border border-[#f7d6d6] p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Applied</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-900">{totalApplications}</span>
                  <span className="text-xs text-slate-500">jobs</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#f7d6d6] p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">In Review</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-amber-700">{totalApplicationsDue}</span>
                  <span className="text-xs text-slate-500">active</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#f7d6d6] p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">Accepted</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-emerald-700">{totalApplicationsAccepted}</span>
                  <span className="text-xs text-slate-500">offers</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#f7d6d6] p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block">Interviews</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-purple-700">{interviewsAttended}</span>
                  <span className="text-xs text-slate-500">attended</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#f7d6d6] p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-500 block">Declined</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-red-600">{totalApplicationsRejected}</span>
                  <span className="text-xs text-slate-500">closed</span>
                </div>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Background, Experience & Skills */}
              <div className="lg:col-span-2 space-y-6">
                {/* Background & Experience Card */}
                <div className="bg-white rounded-2xl border border-[#f7d6d6] p-6 sm:p-7 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Professional Experience</span>
                    </h2>
                  </div>

                  <div>
                    {candidateDetails?.experience ? (
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {candidateDetails.experience}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        No professional experience added yet. Click &quot;Complete Profile&quot; to highlight your background.
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      <span>Education & Academics</span>
                    </h3>
                    {candidateDetails?.education ? (
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {candidateDetails.education}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        No academic information provided yet. Click &quot;Complete Profile&quot; to add education details.
                      </p>
                    )}
                  </div>
                </div>

                {/* Skills Showcase Card */}
                <div className="bg-white rounded-2xl border border-[#f7d6d6] p-6 sm:p-7 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span>Skills & Core Competencies</span>
                    </h2>
                    <span className="text-xs font-semibold text-slate-400">
                      {candidateDetails?.skills?.length || 0} skills listed
                    </span>
                  </div>

                  {candidateDetails?.skills && candidateDetails.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {candidateDetails.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3.5 py-1.5 rounded-xl bg-[#fdeaea] border border-[#f7d6d6] text-rose-700 font-semibold text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#fdeaea]/40 border border-[#f7d6d6] text-center">
                      <p className="text-xs text-slate-500">
                        No technical skills specified yet. Add skills to get better AI match recommendations.
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Interviews & Mock Assessments Card */}
                <div className="bg-white rounded-2xl border border-[#f7d6d6] p-6 sm:p-7 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>AI Interviews & Mock Sessions</span>
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {DUMMY_INTERVIEWS.length} Attended
                    </span>
                  </div>

                  <div className="space-y-3">
                    {DUMMY_INTERVIEWS.map((interview) => (
                      <div
                        key={interview._id}
                        className="p-3.5 rounded-xl border border-[#f7d6d6] bg-[#fdeaea]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fdeaea]/60 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">{interview.title}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white text-rose-700 border border-rose-200">
                              {interview.mode === 'recruitment' ? 'Recruiter Round' : 'AI Practice'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{interview.company}</span>
                            <span>•</span>
                            <span>{interview.duration}</span>
                            <span>•</span>
                            <span>{interview.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-900">{interview.overallScore}% Score</div>
                            <div className="text-[10px] font-semibold text-emerald-600">{interview.verdict}</div>
                          </div>
                          <button
                            onClick={() => navigate('/candidate/practice')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#f7d6d6] hover:bg-rose-50 text-rose-600 transition shadow-xs cursor-pointer"
                          >
                            Practice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Account Snapshot & Quick Navigation */}
              <div className="space-y-6">
                {/* Account Snapshot Card */}
                <div className="bg-white rounded-2xl border border-[#f7d6d6] p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                    Profile Information
                  </h3>
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Account Type</span>
                      <span className="font-semibold text-slate-800">{user?.role || 'Candidate'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Preferred Target</span>
                      <span className="font-semibold text-slate-800">{candidateDetails?.preferredRole || 'Any'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Resume File</span>
                      <span className="font-semibold text-slate-800">
                        {candidateDetails?.resumeUrl ? 'Uploaded' : 'Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-500">Member Since</span>
                      <span className="font-semibold text-slate-800">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts Card */}
                <div className="bg-white rounded-2xl border border-[#f7d6d6] p-6 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Quick Navigation
                  </h3>

                  <button
                    onClick={() => navigate('/candidate/applications')}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[#f7d6d6] hover:bg-[#fdeaea]/60 transition text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Track Applications ({totalApplications})</span>
                    </span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => navigate('/candidate/practice')}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[#f7d6d6] hover:bg-[#fdeaea]/60 transition text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>AI Practice Arena</span>
                    </span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => navigate('/candidate/home')}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[#f7d6d6] hover:bg-[#fdeaea]/60 transition text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Explore Open Jobs</span>
                    </span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Profile Edit / Setup Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#f7d6d6] rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {candidateDetails ? 'Edit Candidate Profile' : 'Setup Candidate Profile'}
                </h3>
                <p className="text-xs text-slate-500">
                  Update your candidate credentials visible to recruiters and employers.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formErr && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                {formErr}
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                Profile saved successfully!
              </div>
            )}

            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Swarnava Chakraborty"
                  className="w-full px-3.5 py-2.5 text-xs border border-[#f7d6d6] rounded-xl outline-none focus:border-rose-500 text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Role / Designation
                </label>
                <input
                  type="text"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  placeholder="e.g. FullStack Developer, AI Engineer"
                  className="w-full px-3.5 py-2.5 text-xs border border-[#f7d6d6] rounded-xl outline-none focus:border-rose-500 text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Education & Degree
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. B.Tech in Computer Science, 2024"
                  className="w-full px-3.5 py-2.5 text-xs border border-[#f7d6d6] rounded-xl outline-none focus:border-rose-500 text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Experience Summary
                </label>
                <textarea
                  rows={3}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Summarize your past work experience, internships, or key projects..."
                  className="w-full px-3.5 py-2.5 text-xs border border-[#f7d6d6] rounded-xl outline-none focus:border-rose-500 text-slate-800 transition leading-relaxed"
                />
              </div>

              {/* Skills Tag Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Skills & Technologies (Press Enter or comma to add)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Type a skill and press Enter..."
                  className="w-full px-3.5 py-2.5 text-xs border border-[#f7d6d6] rounded-xl outline-none focus:border-rose-500 text-slate-800 transition"
                />
                {skillsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {skillsList.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#fdeaea] border border-[#f7d6d6] text-rose-700 font-semibold text-xs"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-rose-900 cursor-pointer font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Resume File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Resume (PDF / Document)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#fdeaea] file:text-rose-700 hover:file:bg-rose-100 transition cursor-pointer"
                />
                {candidateDetails?.resumeUrl && !resumeFile && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Current resume is uploaded. Select a new file only if you wish to replace it.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default CandidateProfile;
