import express from 'express'
const route = express.Router()
import upload from '../middlewares/multer.js'
import userControllers from "../controllers/user.controllers.js"

route.post("/register", upload.single("avatar"), userControllers.Register)

// route.post("/login", userControllers.Login)

export default route