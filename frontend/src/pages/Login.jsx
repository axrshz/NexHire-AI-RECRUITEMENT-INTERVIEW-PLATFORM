import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: location.state?.verifiedEmail || '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isUnverified, setIsUnverified] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
    setIsUnverified(false)
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setIsUnverified(false)

    if (!formData.email.trim()) {
      setError('Please enter your email.')
      return
    }

    if (!formData.password) {
      setError('Please enter your password.')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })

      if (response.status === 200) {
        const { user, accessToken } = response.data.data

        // Store auth tokens and user profile
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken)
        }
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user))
        }

        // Role-based redirection
        if (user?.role === 'Candidate') {
          navigate('/candidate/home')
        } else if (user?.role === 'Recruiter') {
          navigate('/recruiter/home')
        } else {
          // Default fallback
          navigate('/')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.'

      setError(errorMsg)
      if (
        errorMsg.toLowerCase().includes('not verified') ||
        errorMsg.toLowerCase().includes('verify')
      ) {
        setIsUnverified(true)
      }
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
          Welcome back to NexHire
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to access your dashboard and active workflows
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#f7d6d6] rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              <div className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
              {isUnverified && (
                <div className="mt-2.5 pt-2 border-t border-rose-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/verify-otp', {
                        state: { email: formData.email.trim().toLowerCase() },
                      })
                    }
                    className="text-xs font-bold text-rose-700 hover:text-rose-800 underline cursor-pointer"
                  >
                    Go to OTP Verification &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
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
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              />
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
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/" className="font-semibold text-rose-600 hover:text-rose-700 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
