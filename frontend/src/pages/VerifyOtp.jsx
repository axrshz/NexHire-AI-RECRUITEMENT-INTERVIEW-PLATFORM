import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function VerifyOtp() {
  const location = useLocation()
  const navigate = useNavigate()

  const initialEmail = location.state?.email || ''
  const [email, setEmail] = useState(initialEmail)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resending, setResending] = useState(false)

  const inputRefs = useRef([])

  useEffect(() => {
    // Focus the first digit input on page load
    inputRefs.current[0]?.focus()
  }, [])

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1) // Take the last digit if multiple
    setOtpDigits(newDigits)
    setError('')

    // Auto-focus next input box if a digit was entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleVerify(newDigitsToOtp(otpDigits))
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim()
    if (/^\d{1,6}$/.test(pasted)) {
      const digits = pasted.split('')
      const newDigits = [...otpDigits]
      digits.forEach((d, i) => {
        if (i < 6) newDigits[i] = d
      })
      setOtpDigits(newDigits)
      const nextFocus = Math.min(digits.length, 5)
      inputRefs.current[nextFocus]?.focus()
    }
  }

  const newDigitsToOtp = (digits) => digits.join('')

  const handleVerify = async (submittedOtp) => {
    const finalOtp = submittedOtp || otpDigits.join('')
    setError('')
    setSuccess('')

    if (finalOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/user/verify-otp', {
        otp: finalOtp,
        email: email.trim().toLowerCase(),
      })

      if (response.status === 200 || response.status === 201) {
        setSuccess('Email successfully verified! Redirecting to login...')
        setTimeout(() => {
          navigate('/', {
            state: { verifiedEmail: email.trim().toLowerCase() },
          })
        }, 1000)
      }
    } catch (err) {
      console.error('OTP verification failed:', err)
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Verification failed. Please check the code and try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Please provide an email to resend OTP.')
      return
    }
    setError('')
    try {
      setResending(true)
      // If there's a dedicated resend endpoint or we re-trigger
      await api.post('/resend-otp', { email: email.trim() }).catch(() => {
        // Fallback message if backend doesn't have dedicated resend yet
      })
      setSuccess('If an account exists, a new code has been sent to your email.')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not resend OTP right now.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdeaea] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-500/20 mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Verify your email
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter the 6-digit code sent to{' '}
          <span className="font-semibold text-rose-600">{email || 'your email'}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#f7d6d6] rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
              <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* If opened without state, let user verify or change email */}
          {!location.state?.email && (
            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Registered Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          )}

          {/* 6-box OTP input */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3 text-center">
              Enter 6-Digit OTP Code
            </label>
            <div className="flex justify-between items-center gap-2" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-13 text-center text-xl font-bold rounded-xl border border-slate-200 text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition shadow-xs"
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={loading}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify OTP & Continue</span>
            )}
          </button>

          {/* Resend & Return Links */}
          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer disabled:opacity-50"
            >
              {resending ? 'Sending...' : "Didn't get code? Resend"}
            </button>
            <Link to="/login" className="text-slate-600 hover:text-slate-800 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
