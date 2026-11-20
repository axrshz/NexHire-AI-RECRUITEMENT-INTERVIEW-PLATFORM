import mongoose from "mongoose";
import jobModel from "../models/job.model.js";

const createJob = async (jobData) => {
    const job = await jobModel.create(jobData)
    return job;
}
