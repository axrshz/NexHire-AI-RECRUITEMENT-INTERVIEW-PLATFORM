import jobModel from "../models/job.model.js"
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js"
import apiError from "../utils/apiError.js";
import jobService from "../services/job.service.js"

const createJobPost = asyncHandler(async (req, res) => {

    const { title, description, experience, location, salary, status, requiredSkills, vacancies } = req.body

    if (!title || !description || !experience || !location || !salary || !requiredSkills || !vacancies) {
        throw new apiError(400, "all fields are required")
    }

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
        new apiResponse(200, "job created successfully", job)
    )
}
)


const getFeedJobs = asyncHandler(async function (req, res) {

    const feedJobs = await jobModel.aggregate([
        {
            $match: {}
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "postedBy",
                foreignField: "_id",
                as: "postedBy",
                pipeline: [
                    {
                        $lookup: {
                            from: "companymembers",
                            localField: "_id",
                            foreignField: "userId",
                            as: "details",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "companies",
                                        localField: "companyId",
                                        foreignField: "_id",
                                        as: "company",
                                        pipeline: [
                                            {
                                                $project: {
                                                    name: 1,
                                                    logo: 1
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    $addFields: {
                                        company: { $first: "$company" }
                                    }
                                },
                                {
                                    $project: {
                                        company: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            details: {
                                $first: "$details"
                            }
                        }
                    },
                    {
                        $project: {
                            avatar: 1,
                            name: 1,
                            details: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                postedBy: {
                    $first: "$postedBy"
                }
            }
        }
    ])

    if (!feedJobs) {
        throw new apiError(400, "still no jobs posted yet!")
    }

    return res.status(200).json(
        new apiResponse(200, "jobs fetched successfully", feedJobs)
    )
})


//delete job

//getMyJobs


export default { createJobPost, getFeedJobs }