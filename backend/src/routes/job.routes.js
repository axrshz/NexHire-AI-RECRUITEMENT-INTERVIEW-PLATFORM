import express from 'express'
import jobControllers from "../controllers/job.controllers.js"
import authMiddleware from '../middlewares/auth.middleware.js'


const route = express.Router()

route.post("/job-post", authMiddleware, jobControllers.createJobPost)

route.delete("/job-post/:id", authMiddleware, jobControllers.deleteJobPost)

route.get("/job-post", authMiddleware, jobControllers.getAllJobPosts)
