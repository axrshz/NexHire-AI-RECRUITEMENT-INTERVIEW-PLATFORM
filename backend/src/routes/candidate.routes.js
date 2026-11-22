import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";
import candidateControllers from "../controllers/candidate.controllers.js";

const route = express.Router();

route.get("/get-profile", authMiddleware, candidateControllers.getProfile);
route.post("/set-profile", authMiddleware, upload.single("resume"), candidateControllers.setProfile);
route.patch("/update-profile", authMiddleware, upload.single("resume"), candidateControllers.updateProfile);
route.delete("/delete-profile/:profile_id", authMiddleware, candidateControllers.deleteProfile);

export default route;
