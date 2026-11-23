import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios.js'
import { asyncHandler } from '../api/axios.js'

function CandidateJob() {
    const { id } = useParams()
    const [job, setJob] = useState({})
    const [loading, setLoading] = useState(false)
    const [candidate, setCandidate] = useState({})
    const [applied, setApplied] = useState(true)

    useEffect(() => {

        asyncHandler(async function () {
            setLoading(true)
            api.get(`/job/job-details/${id}`)
                .then((res) => {
                    setJob(res.data.data)
                })
                .catch((err) => {
                    console.log(err.response.message)
                })
                .finally(() => { setLoading(false) })
        })
    }, [])

    const onApply = () => {
        asyncHandler(async function () {
            setLoading(true)
            api.get("/candidate/get-profile")
                .then((res) => {
                    setCandidate(res.data.data)
                })
                .then(() => {
                    api.get(`/job/apply/${id}`)
                        .then((res) => {
                            setApplied(true)
                        })
                        .catch((err) => {
                            console.log(err.response.message)
                        })
                })
                .finally(() => { setLoading(false) })
        })
    }

    return (
        <div>job page</div>
    )
}

export default CandidateJob