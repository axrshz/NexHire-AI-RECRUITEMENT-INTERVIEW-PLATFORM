import express from 'express'
import jobControllers from "../controllers/job.controllers.js"
import authMiddleware from '../middlewares/auth.middleware.js'


const route = express.Router()

route.post("/job-post", authMiddleware, jobControllers.createJobPost)
route.get("/feed", jobControllers.getFeedJobs)
route.get("/job-details/:job_id",authMiddleware, jobControllers.getJobDetails)
route.get("/apply/:job_id", authMiddleware, jobControllers.jobApplicationToggle)

export default route
