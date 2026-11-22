import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import uploadFile from "../utils/cloudinary.js";
import candidateModel from "../models/candidate.model.js";



const setProfile = asyncHandler(async function (req, res) {
    const { fullName, education, experience, skills, preferredRole } = req.body;
    const userId = req.user?._id;

    if (!fullName) {
        throw new apiError(400, "Full name is required");
    }

    // Check if profile already exists
    const existing = await candidateModel.findOne({ userId });
    if (existing) {
        throw new apiError(400, "Profile already exists. Use update profile instead.");
    }

    let resumeUrl = "";
    if (req.file) {
        const uploadResult = await uploadFile(req.file.path);
        if (!uploadResult || (!uploadResult.secure_url && !uploadResult.url)) {
            throw new apiError(500, "Could not upload resume");
        }
        resumeUrl = uploadResult.secure_url || uploadResult.url;
    }

    let parsedSkills = [];
    if (skills) {
       parsedSkills = JSON.parse(skills)//parses the string formatted array from the frontend into array
    }

    const candidate = await candidateModel.create({
        userId,
        fullName: fullName.trim(),
        education: education ? education.trim() : "",
        experience: experience ? experience.trim() : "",
        skills: parsedSkills,
        preferredRole: preferredRole ? preferredRole.trim() : "",
        resumeUrl
    });

    if (!candidate) {
        throw new apiError(500, "Could not create candidate profile");
    }

    return res.status(201).json(
        new apiResponse(201, "Profile created successfully", candidate)
    );
});



const updateProfile = asyncHandler(async function (req, res) {
    const userId = req.user?._id;

    if (!userId) {
        throw new apiError(401, "Unauthorized: User not found");
    }

    const { fullName, education, experience, skills, preferredRole } = req.body;


    const existingProfile = await candidateModel.findOne({ userId });
    if (!existingProfile) {
        throw new apiError(404, "Candidate profile not found");
    }

    const updateFields = {};

    if (fullName !== undefined) updateFields.fullName = fullName.trim();
    if (education !== undefined) updateFields.education = education.trim();
    if (experience !== undefined) updateFields.experience = experience.trim();
    if (preferredRole !== undefined) updateFields.preferredRole = preferredRole.trim();

    if (skills || skills !== undefined) {
        const parsedSkills = JSON.parse(skills)
        updateFields.skills = parsedSkills
    }

    if (req.file) {
        const uploadResult = await uploadFile(req.file.path);
        if (!uploadResult || (!uploadResult.secure_url && !uploadResult.url)) {
            throw new apiError(500, "Failed to upload resume to Cloudinary");
        }
        updateFields.resumeUrl = uploadResult.secure_url || uploadResult.url;
    }

    const updatedProfile = await candidateModel.findOneAndUpdate(
        { userId },
        { $set: updateFields },
        { new: true, runValidators: true }
    );

    return res.status(200).json(
        new apiResponse(200, "Candidate profile updated successfully", updatedProfile)
    );
});



const getProfile = asyncHandler(async function (req, res) {
    const userId = req.user?._id;

    const profile = await candidateModel.findOne({ userId });

    if (!profile) {
        return res.status(200).json(
            new apiResponse(200, "No profile created yet", null)
        );
    }

    return res.status(200).json(
        new apiResponse(200, "Candidate profile retrieved successfully", profile)
    );
});



const deleteProfile = asyncHandler(async function (req, res) {
    const userId = req.user?._id;
    const { profile_id } = req.params;

    const foundProfile = await candidateModel.findOneAndDelete({
        _id: profile_id,
        userId
    });

    if (!foundProfile) {
        throw new apiError(404, "No profile found to delete");
    }

    return res.status(200).json(
        new apiResponse(200, "Profile deleted successfully")
    );
});

export default {
    setProfile,
    updateProfile,
    getProfile,
    deleteProfile
};
