import jobRepository from "../repository/job.repository.js"

const createJob = async (jobData) => {
    const job = await jobRepository.createJob(jobData)
    return job;
}

export default { createJob };