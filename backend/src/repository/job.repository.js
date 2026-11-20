import mongoose from "mongoose";
import jobModel from "../models/job.model.js";

const createJob = async (jobData) => {
    const job = await jobModel.create(jobData)
    return job;
}

const deleteJob = async (jobId) => {
    const job = await jobModel.findByIdAndDelete(jobId)
    return job;
}

const getAllJobs = async (recruiterId) => {
    const jobs = await jobModel.find({ postedBy: recruiterId }).populate("postedBy", "name email")
    return jobs;
}

