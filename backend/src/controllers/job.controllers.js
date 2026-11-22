import jobModel from "../models/job.model.js"
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js"
import apiError from "../utils/apiError.js";
import jobService from "../services/job.service.js"
import applicationModel from "../models/application.model.js";
import candidateModel from "../models/candidate.model.js"
import mongoose from "mongoose";
import companyMemberModel from "../models/companyMember.model.js";
import notificationModel from "../models/notification.model.js"
import userModel from "../models/user.model.js";


const createJobPost = asyncHandler(async (req, res) => {

    const { title, description, experience, location, salary, status, requiredSkills, vacancies } = req.body


    const jobData = {
        title,
        description,
        experience,
        location,
        salary,
        status: "Open",
        requiredSkills,
        vacancies,
        postedBy: req.user?._id
    }

    const job = await jobService.createJob(jobData)

    if (!job) {
        throw new apiError(400, "could'nt create job")
    }

    res.status(201).json(
        new apiResponse(201, "job created successfully", job)
    )
}
)

const getFeedJobs = asyncHandler(async function (req, res) {

    const feedJobs = await jobService.getFeedJobs()

    if (!feedJobs) {
        throw new apiError(400, "still no jobs posted yet!")
    }

    return res.status(200).json(
        new apiResponse(200, "jobs fetched successfully", feedJobs)
    )
})

const getJobDetails = asyncHandler(async function (req, res) {
    const { job_id } = req.params

    const jobDetails = await jobService.getJobDetails(job_id)

    if (!jobDetails) {
        throw new apiError(400, "could'nt fetch job details")
    }

    return res.status(200).json(
        new apiResponse(200, "details fetched successfully", jobDetails)
    )
})

const jobApplicationToggle = asyncHandler(async function (req, res) {

    const { job_id } = req.params
    const user_id = req.user._id

    const foundApplication = await applicationModel.findOne({
        jobId: job_id,
        candidateId: user_id
    })

    const foundJob = await jobModel.findById(job_id)
    if (!foundJob) {
        throw new apiError(400, "job does'nt exist")
    }

    let createdApplication = null

    if (!foundApplication) {
        const candidate = await candidateModel.findOne({ userId: user_id }).select("resumeUrl")
        const resumeUrl = candidate.resumeUrl
        const job = await jobModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(job_id) }
            },
            {
                $lookup: {
                    from: "companymembers",
                    localField: "postedBy",
                    foreignField: "userId",
                    as: "postedBy",
                    pipeline: [
                        {
                            $project: {
                                companyId: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: { postedBy: { $first: "$postedBy.companyId" } }
            }
        ])

        createdApplication = await jobService.createApplication({
            candidateId: user_id,
            jobId: job_id,
            companyId: job[0].postedBy,
            resumeUrl,
        })

        if (!createdApplication) {
            throw new apiError(400, "could'nt create application")
        }

        const user = await userModel.findById(user_id).select("name")
        await notificationModel.create({
            recipientId: foundJob.postedBy, // The recruiter
            type: "NEW_APPLICATION",
            title: "New Applicant Received",
            message: `${user.name} just applied for the ${foundJob.title}.`,
            actionUrl: `/recruiter/jobs/${foundJob._id}`,
            isRead: false
        })
    } else {
        await jobService.deleteApplication({
            candidateId: user_id,
            jobId: job_id
        })
    }

    return res.status(foundApplication ? 200 : 201).json(
        new apiResponse(foundApplication ? 200 : 201, foundApplication ? "unapplied successfully" : "applied successfully", foundApplication ? null : createdApplication)
    )
})

//delete job

//getMyJobs

//getJobApplicants(candidate list with name and avatar)(params: job_id)

//accept application(send notification to candidate)

//reject application

export default { createJobPost, getFeedJobs, getJobDetails, jobApplicationToggle }
