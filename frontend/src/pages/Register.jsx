import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Candidate',
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.')
        return
      }
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setError('')

    // Client-side validation matching backend
    if (!formData.name.trim()) {
      setError('Name is required.')
      return
    }

    if (!formData.email.trim() || !formData.email.toLowerCase().endsWith('@gmail.com')) {
      setError('Please provide a valid Gmail address (must end with @gmail.com).')
      return
    }

    if (!formData.password || formData.password.length < 5 || formData.password.length > 20) {
      setError('Password must be between 5 and 20 characters.')
      return
    }

    if (!avatar) {
      setError('Please upload an avatar image.')
      return
    }

    try {
      setLoading(true)
      const data = new FormData()
      data.append('name', formData.name.trim())
      data.append('email', formData.email.trim().toLowerCase())
      data.append('password', formData.password)
      data.append('role', formData.role)
      data.append('avatar', avatar)

      const response = await api.post('/user/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.status === 200 || response.status === 201) {
        // Redirect to OTP verification page with user email
        navigate('/verify-otp', {
          state: {
            email: formData.email.trim().toLowerCase(),
            name: formData.name.trim(),
          },
        })
      }
    } catch (err) {
      console.error('Registration failed:', err)
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please check your details and try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdeaea] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-500/20 mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Join <span className="font-semibold text-rose-600">NexHire</span> to access AI-driven hiring & interviews
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#f7d6d6] rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Jane Doe"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Gmail Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="janedoe@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Must be an active @gmail.com address to receive your verification OTP.
              </span>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="5 to 20 characters"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                I am registering as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'Candidate' }))}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                    formData.role === 'Candidate'
                      ? 'border-rose-600 bg-rose-50/70 text-rose-700 ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Candidate
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'Recruiter' }))}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                    formData.role === 'Recruiter'
                      ? 'border-rose-600 bg-rose-50/70 text-rose-700 ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Recruiter
                </button>
              </div>
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Profile Avatar
              </label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-rose-200 overflow-hidden bg-rose-50 flex items-center justify-center shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-7 h-7 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-medium transition inline-flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{avatar ? avatar.name : 'Upload Avatar Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <span>Register & Continue to OTP</span>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-700 hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
