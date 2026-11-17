import asyncHandler from "../utils/asyncHandler.js";
import userModel from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import uploadFile from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

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



const DefaultLogin = asyncHandler(async function (req, res) {

    const { email, password } = req.body

    if (!email) {
        throw new apiError(400, "email is required")
    }

    const foundUser = await userModel.findOne({
        email: email
    })

    if (!foundUser) {
        throw new apiError(400, "invalid email")
    }

    const matched = foundUser.verifyPassword(password)

    if (!matched) {
        throw new apiError(400, "invalid password")
    }

    const accessToken = foundUser.generateAccessToken()
    const refreshToken = foundUser.generateRefreshToken()

    return res.status(200).cookie("refreshToken", refreshToken, options).json(
        new apiResponse(200, "logged in successfully", { foundUser, accesstoken: accessToken })
    )
})


const getCurrUser = asyncHandler(async function (req, res) {
    const curr_user_id = req.user._id

    const user = await userModel.findOne({
        _id: curr_user_id
    })

    return res.status(200).json(
        new apiResponse(200, "user fetched successfully", user)
    )
})


const refreshToken = asyncHandler(async function (req, res) {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        throw new apiError(401, "unauthorised")
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await userModel.findOne({ _id: decoded._id })

    const accessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()

    return res.status(200).cookie("refreshToken", newRefreshToken).json(
        new apiResponse(200, "refreshed token successfully", { accessToken })
    )
})


const logout = asyncHandler(async function (req, res) {

    const curr_user_id = req.user._id

    if (!curr_user_id) {
        throw new apiError(401, "user is not logged in")
    }

    res.clearCookie("refreshToken")

    res.status(200).json(
        new apiResponse(200, "logged out successfully")
    )

})

export default { Register, DefaultLogin, getCurrUser, refreshToken, logout }