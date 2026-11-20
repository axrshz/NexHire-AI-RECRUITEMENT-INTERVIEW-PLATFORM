import jobModel from "../models/job.model.js"
import asyncHandler from "../utils/asyncHandler.js";
import jobService from "../services/job.service.js"
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

const createJobPost = asyncHandler(async (req, res) => {
    const { title, description, experience, location, salary, status, requiredSkills, vacancies } = req.body
    
    
    const jobData = {
        title,
        description,
        experience,
        location,
        salary,
        status,
        requiredSkills,
        vacancies,
        postedBy: req.user._id
    }

    const job = await jobService.createJob(jobData)

    res.status(201).json({
        success: true,
        job
    })
}
)

const deleteJobPost = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        throw new apiError(400, "job id is required")
    }
    const jobId = req.params.id
    const job = await jobService.deleteJob(jobId)

    res.status(200).json({
        success: true,
        job
    })
}
)

const getAllJobPosts = asyncHandler(async (req, res) => {
    const recruiterId = req.user._id
    if (!recruiterId ) {
        throw new apiError(400, "recruiter id is required")
    }
    const jobs = await jobService.getAllJobs(recruiterId)

    res.status(200).json({
        success: true,
        jobs
    })
}
)

export default {
    createJobPost,
    deleteJobPost,
    getAllJobPosts
}