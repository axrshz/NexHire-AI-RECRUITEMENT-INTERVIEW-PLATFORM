import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import uploadFile from "../utils/cloudinary.js";
import companyModel from "../models/company.model.js";
import companyMemberModel from "../models/companyMember.model.js";
import mongoose from "mongoose";

const getAllNotifications = asyncHandler()

const readNotification = asyncHandler()

const deleteNotification = asyncHandler()

const deleteAllNotification = asyncHandler()


export default {}