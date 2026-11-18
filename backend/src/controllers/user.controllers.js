import asyncHandler from "../utils/asyncHandler.js";
import userModel from "../models/user.model.js";
import otpModel from "../models/otp.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import uploadFile from "../utils/cloudinary.js";
import sendEmail from '../services/email.service.js'
import { generateOtp, generateHTMLotp } from "../utils/otp.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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

    const otp = generateOtp()
    const otpHTML = generateHTMLotp(otp)

    await otpModel.create({
        email,
        user: user._id,
        otp: otp
    })

    await sendEmail(email, "OTP verification", `your otp is ${otp}`, otpHTML)

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

const verifyOtp = asyncHandler(async function (req, res) {
    const { otp, email } = req.body

    if (!otp) {
        throw new apiError(400, "otp is required")
    }

    const query = { otp: String(otp).trim() }
    if (email) {
        query.email = email.trim()
    }

    const otpDoc = await otpModel.findOne(query)

    if (!otpDoc) {
        throw new apiError(400, "invalid or expired otp")
    }

    const foundUser = await userModel.findByIdAndUpdate(
        otpDoc.user,
        { verified: true },
        { new: true }
    ).select("-password -refreshToken")

    await otpModel.deleteMany({
        user: otpDoc.user
    })

    return res.status(200).json(
        new apiResponse(200, "email verified successfully", foundUser)
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

    if (!foundUser.verified) {
        throw new apiError(401, "email is not verified")
    }

    const matched = await foundUser.verifyPassword(password)

    if (!matched) {
        throw new apiError(400, "invalid password")
    }

    const accessToken = foundUser.generateAccessToken()
    const refreshToken = foundUser.generateRefreshToken()

    foundUser.refreshToken = refreshToken
    await foundUser.save({ validateBeforeSave: false })

    const loggedInUser = await userModel.findById(foundUser._id).select("-password -refreshToken")

    return res.status(200).cookie("refreshToken", refreshToken, options).json(
        new apiResponse(200, "logged in successfully", { user: loggedInUser, accessToken })
    )
})


const getCurrUser = asyncHandler(async function (req, res) {
    const curr_user_id = req.user._id

    const user = await userModel.findById(curr_user_id).select("-password -refreshToken")

    const token = req.headers.authorization.split(" ")[1]

    return res.status(200).json(
        new apiResponse(200, "user fetched successfully", { user, accessToken: token })
    )
})


const refreshToken = asyncHandler(async function (req, res) {
    const incomingRefreshToken = req.cookies?.refreshToken

    if (!incomingRefreshToken) {
        throw new apiError(401, "unauthorised: refresh token missing")
    }

    try {
        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await userModel.findById(decoded?._id)

        if (!user) {
            throw new apiError(401, "invalid refresh token: user not found")
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new apiError(401, "refresh token is expired or has been used")
        }

        const accessToken = user.generateAccessToken()
        const newRefreshToken = user.generateRefreshToken()

        user.refreshToken = newRefreshToken
        await user.save({ validateBeforeSave: false })

        return res.status(200).cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(200, "refreshed token successfully", { accessToken })
            )
    } catch (error) {
        throw new apiError(401, error?.message || "invalid refresh token")
    }
})


const logout = asyncHandler(async function (req, res) {
    const curr_user_id = req.user._id

    if (!curr_user_id) {
        throw new apiError(401, "user is not logged in")
    }

    const user = await userModel.findById(curr_user_id)
    if (user) {
        user.refreshToken = null
        await user.save({ validateBeforeSave: false })
    }

    res.clearCookie("refreshToken", options)

    res.status(200).json(
        new apiResponse(200, "logged out successfully")
    )
})

export default { Register, DefaultLogin, verifyOtp, getCurrUser, refreshToken, logout }