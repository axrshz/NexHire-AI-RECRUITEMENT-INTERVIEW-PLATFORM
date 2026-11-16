import asyncHandler from "../utils/asyncHandler.js";
import userModel from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import uploadFile from "../utils/cloudinary.js";


const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none"
}


const Register = asyncHandler(async function (req, res) {
    const { name, email, password, role } = req.body

    if (!email.endsWith('@gmail.com')) {
        throw new apiError(400, "invalid email format")
    }


    if (email != "") {
        const emailExists = await userModel.findOne({
            email: email
        })


        if (emailExists) {
            throw new apiError(400, "email already in use")
        }
    }
    else {
        throw new apiError(400, "email is required")
    }

    let result
    if (req.file) {

        result = await uploadFile(req.file.path)

    }
    else {
        throw new apiError(400, "avatar is required")
    }

    if (!password || password.length < 5 || password.length > 20) {
        throw new apiError(400, "password must be between 5 and 20 characters")
    }

    if (!role) {
        throw new apiError(400, "please select your role")
    }

    if (!result || !result.url) {
        throw new apiError(500, "Failed to upload avatar to Cloudinary")
    }

    const user = await userModel.create({
        name: name,
        email: email,
        password: password,
        role: role,
        avatar: result.url
    })

    const userCreated = await userModel.findById({
        _id: user._id
    }).select("-password -refreshToken")

    if (!userCreated) {
        throw new apiError(500, "something went wrong")
    }

    return res.status(201).json(
        new apiResponse(200, "user registered successfully", userCreated) 
    )
})

export default { Register }