import jobRepository from "../repository/job.repository.js"

const createJob = async (jobData) => {
    const job = await jobRepository.createJob(jobData)
    return job;
}

const deleteJob = async (jobId) => {
    const job = await jobRepository.deleteJob(jobId)
    return job;
}

const getAllJobs = async (recruiterId) => {
    const jobs = await jobRepository.getAllJobs(recruiterId)
    return jobs;
}

export default {
    createJob,
    deleteJob,
    getAllJobs
}
