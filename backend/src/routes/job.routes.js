import express from 'express'
import jobControllers from "../controllers/job.controllers.js"
import authMiddleware from '../middlewares/auth.middleware.js'


const route = express.Router()

route.post("/job-post", authMiddleware, jobControllers.createJobPost)
route.get("/feed", jobControllers.getFeedJobs)
route.get("/job-details/:job_id", authMiddleware, jobControllers.getJobDetails)
route.post("/apply/:job_id", authMiddleware, jobControllers.jobApplicationToggle)
route.delete("/delete-job/:job_id", authMiddleware, jobControllers.deleteJobPost)
route.get("/recruiter-jobs", authMiddleware, jobControllers.getMyJobs)
route.get("/job-applicants", authMiddleware, jobControllers.getJobApplicants)
route.get("/user-applications", authMiddleware, jobControllers.getMyApplications)

export default route
