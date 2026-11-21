import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";
import candidateControllers from "../controllers/candidate.controllers.js";

const route = express.Router();

route.post("/set-profile", authMiddleware, upload.single("resume"), candidateControllers.setProfile)


export default route