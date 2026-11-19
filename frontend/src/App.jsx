import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import VerifyOtp from './pages/VerifyOtp'
import RecruiterHome from './pages/Recruiter.home'
import CandidateHome from './pages/Candidate.home'
import Sidebar from './components/Sidebar'
import CandidateProfile from './pages/Candidate.profile'
import CandidateApplications from './pages/Candidate.applications'
import CandidateInterviews from './pages/Candidate.interviews'
import CandidatePractice from './pages/Candidate.practice'

function App() {
  // i am adarsh
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Recruiter Portal */}
        <Route path="/recruiter/home" element={<RecruiterHome />} />

        {/* Candidate Portal */}
        <Route path="/candidate" element={<Sidebar />}>
          <Route path="/candidate/home" element={<CandidateHome />} />
          <Route path="/candidate/applications" element={<CandidateApplications />} />
          <Route path="/candidate/interviews" element={<CandidateInterviews />} />
        </Route>
        <Route path="/candidate/practice" element={<CandidatePractice />} />
        <Route path="/candidate/profile" element={<CandidateProfile />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
