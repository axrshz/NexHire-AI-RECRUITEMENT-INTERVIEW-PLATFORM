import jwt from "jsonwebtoken";
import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";



const authMiddleware = asyncHandler(async function (req, res, next) {

    const token = req.headers.authorization.split(" ")[1]

    if (!token) {
        throw new apiError(401, "unauthorised: token not found")
    }

    try {

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = decoded
        next()

    } catch (error) {
        throw new apiError(error.statusCode || 400, error.message || "invalid access token")
    }
})


export default authMiddleware