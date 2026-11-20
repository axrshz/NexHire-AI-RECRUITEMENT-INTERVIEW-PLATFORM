import jobModel from "../models/job.model.js"
import asyncHandler from "../utils/asyncHandler.js";
import jobService from "../services/job.service.js"

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

