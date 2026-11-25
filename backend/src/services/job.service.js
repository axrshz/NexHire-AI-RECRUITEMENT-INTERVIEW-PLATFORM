import jobRepository from "../repository/job.repository.js"

const createJob = async (jobData) => {
    const job = await jobRepository.createJob(jobData)
    return job;
}

const deleteJob = async (jobId) => {
    const job = await jobRepository.deleteJob(jobId)
    return job;
}

const getMyJobs = async (recruiterId) => {
    const jobs = await jobRepository.getAllJobs(recruiterId)
    return jobs;
}

const getFeedJobs = async () => {
    const jobs = await jobRepository.getFeedJobs()
    return jobs;
}

const getJobDetails = async (jobId) => {
    const job = await jobRepository.getJob(jobId)
    return job;
}

const createApplication = async (data) => {
    const createdApplication = await jobRepository.createApplication(data)
    return createdApplication;
}

const deleteApplication = async (data) => {
    const deletedApplication = await jobRepository.deleteApplication(data)
    return deletedApplication;
}

const deleteJobPost = async (jobId) => {
    const deletedJob = await jobRepository.deleteJob(jobId)
    return deletedJob;
}

const findJobById = async (jobId) => {
    const job = await jobRepository.getJob(jobId)
    return job;
}

const getJobApplicants = async (jobId) => {
    const applicants = await jobRepository.getJobApplicants(jobId)
    return applicants;
}

const getMyApplications = async (userId) => {
    const applications = await jobRepository.getMyApplications(userId)
    return applications
}

const findApplicationById = async (applicationId) => {
    const application = await jobRepository.getApplication(applicationId)
    return application;
}

export default {
    createJob,
    deleteJob,
    getMyJobs,
    getJobDetails,
    getFeedJobs,
    createApplication,
    deleteApplication,
    deleteJobPost,
    findJobById,
    getJobApplicants,
    getMyApplications,
    findApplicationById
}
