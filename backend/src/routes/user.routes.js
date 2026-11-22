import express from 'express'
import upload from '../middlewares/multer.js'
import userControllers from "../controllers/user.controllers.js"
import authMiddleware from '../middlewares/auth.middleware.js'

const route = express.Router()

route.post("/register", upload.single("avatar"), userControllers.Register)

route.post("/login", userControllers.DefaultLogin)

route.get("/get-curr-user", authMiddleware, userControllers.getCurrUser)

route.get("/refresh-token", userControllers.refreshToken)

route.post("/verify-otp", userControllers.verifyOtp)
route.post("/verify-email", userControllers.verifyOtp)

route.get("/logout", authMiddleware, userControllers.logout)

route.delete("/delete", authMiddleware, userControllers.deleteAccount)

export default route