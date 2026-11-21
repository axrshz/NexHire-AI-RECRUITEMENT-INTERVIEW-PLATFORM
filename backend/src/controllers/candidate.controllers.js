import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import uploadFile from "../utils/cloudinary.js";
import candidateModel from "../models/candidate.model.js";
import mongoose from "mongoose";


const setProfile = asyncHandler(async function (req, res) {

    const { fullName, education, experience, skills, preferredRole } = req.body
    const userId = req.user?._id

    if (!fullName) {
        throw new apiError(400, "fullname is required")
    }

    let resumeUrl = null
    if (req.file) {
        resumeUrl = await uploadFile(req.file.path)
        if (!resumeUrl.secure_url) {
            throw new apiError(400, "could'nt upload resume")
        }
    }

    const candidate = await candidateModel.create({
        userId,
        fullName,
        education: education ? education : "",
        experience: experience ? experience : "",
        skills: skills.length > 0 ? skills : [],
        preferredRole: preferredRole ? preferredRole : "",
        resumeUrl: resumeUrl ? resumeUrl.secure_url : ""
    })

    if (!candidate) {
        throw new apiError(400, "could'nt create candidate")
    }

    return res.status(200).json(
        new apiResponse(200, "profile created successfully", candidate)
    )

})

export default { setProfile }