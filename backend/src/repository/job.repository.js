import mongoose from "mongoose";
import jobModel from "../models/job.model.js";
import applicationModel from "../models/application.model.js"

const createJob = async (jobData) => {
    const job = await jobModel.create(jobData);
    return job;
}

const deleteJob = async (jobId) => {
    const job = await jobModel.findByIdAndDelete(jobId)
    return job;
}

const getFeedJobs = async () => {
    const jobs = await jobModel.aggregate([
        {
            $match: {
                status: "Open"
            }
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
    return jobs
}

const getMyJobs = async (recruiterId) => {
    const jobs = await jobModel.find({ postedBy: recruiterId }).populate("postedBy", "name avatar")
    return jobs;
}

const getJob = async (jobId, userId) => {
    const job = await jobModel.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(jobId) }
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
                                                    logo: 1,
                                                    name: 1,
                                                    website: 1
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
                                        role: 1,
                                        designation: 1,
                                        company: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            role: { $first: "$details.role" },
                            designation: { $first: "$details.designation" },
                            companyLogo: { $first: "$details.company.logo" },
                            companyName: { $first: "$details.company.name" },
                            companyWebsite: { $first: "$details.company.website" }
                        }
                    },
                    {
                        $project: {
                            avatar: 1,
                            name: 1,
                            role: 1,
                            designation: 1,
                            companyLogo: 1,
                            companyName: 1,
                            companyWebsite: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                postedBy: { $first: "$postedBy" }
            }
        }
    ])
    return job[0];
}

const createApplication = async (data) => {
    const createdApplication = await applicationModel.create(data)
    return createdApplication;
}

const deleteApplication = async (data) => {
    const deletedApplication = await applicationModel.deleteMany(data)
    return deletedApplication;
}


const getAllJobs = async (recruiterId) => {
    const jobs = await jobModel.find({ postedBy: recruiterId })
    return jobs;
}

const getJobApplicants = async (jobId) => {
    const applicants = await applicationModel.aggregate([
        {
            $match: { jobId: new mongoose.Types.ObjectId(jobId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "candidateId",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            $unwind: "$userDetails"
        },
        {
            $project: {
                _id: 1,
                candidateId: 1,
                jobId: 1,
                companyId: 1,
                resumeUrl: 1,
                status: 1,
                createdAt: 1,
                name: "$userDetails.name",
                email: "$userDetails.email",
                avatar: "$userDetails.avatar"
            }
        }
    ])
    return applicants;
}

const getMyApplications = async (userId) => {
    const applications = await applicationModel.aggregate([
        {
            $match: { candidateId: new mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: "jobs",
                localField: "jobId",
                foreignField: "_id",
                as: "jobId"
            }
        },
        {
            $lookup: {
                from: "companies",
                localField: "companyId",
                foreignField: "_id",
                as: "companyId",
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
                jobId: { $first: "$jobId" },
                companyId: { $first: "$companyId" }
            }
        },
        {
            $project: {
                resumeUrl: 0
            }
        }
    ])
    return applications
}

const getApplication = async (applicationId) => {
    const application = await applicationModel.findById(applicationId)
    return application;
}

export default { createJob, deleteJob, getMyJobs, getJob, getFeedJobs, createApplication, deleteApplication, getAllJobs, getJobApplicants, getMyApplications, getApplication };
