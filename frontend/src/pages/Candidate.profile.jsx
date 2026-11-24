import React, { useEffect, useState } from 'react'
import asyncHandler from "../api/axios.js"

function CandidateProfile() {
  const [candidateDetails, setCandidateDetails] = useState({})
  const [user, setUser] = useState({})
  const [totalApplications, setTotalApplications] = useState(0)
  const [interviewsAttended, setInterviewsAttended] = useState(0)
  const [totalApplicationsAccepted, setTotalApplicationsAccepted] = useState(0)
  const [totalApplicationsRejected, setTotalApplicationsRejected] = useState(0)
  const [err, setErr] = useState(null)




  useEffect(() => {
    let isMounted = true
    const fetchUser = asyncHandler(async function () {
      api.get("/user/get-curr-user")
        .then((res) => {
          if (isMounted === true) {
            if (res.data.data.user) {
              setUser(res.data.data.user)
            }
          }
        })
    })
    try {
      fetchUser()
    }
    catch (err) {
      ((err) => { setErr(err.response.message) })
    }
    return () => {
      isMounted = false
    }
  }, [])


  return (
    <div>Candidate.Profile</div>
  )
}

export default CandidateProfile