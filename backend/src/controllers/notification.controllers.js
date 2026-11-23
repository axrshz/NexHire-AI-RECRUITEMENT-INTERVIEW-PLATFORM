import asyncHandler from "../utils/asynchandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import notificationModel from "../models/notification.model.js";
import mongoose from "mongoose";

const getRecipientId = (req) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new apiError(401, "Unauthorized: User not found");
    }

    return userId;
};

const getNotificationFilter = (req) => {
    const recipientId = getRecipientId(req);
    const notificationId = req.params?.notification_id;

    if (!mongoose.isObjectIdOrHexString(notificationId)) {
        throw new apiError(400, "A valid notification_id is required");
    }

    return { _id: notificationId, recipientId };
};

const getAllNotifications = asyncHandler(async function (req, res) {
    const recipientId = getRecipientId(req);
    const notifications = await notificationModel.find({ recipientId })
        .sort({ createdAt: -1, _id: -1 });

    return res.status(200).json(
        new apiResponse(200, "Notifications fetched successfully", notifications)
    );
});

const readNotification = asyncHandler(async function (req, res) {
    const notification = await notificationModel.findOneAndUpdate(
        getNotificationFilter(req),
        { $set: { isRead: true } },
        { new: true, runValidators: true }
    );

    if (!notification) {
        throw new apiError(404, "Notification not found");
    }

    return res.status(200).json(
        new apiResponse(200, "Notification marked as read", notification)
    );
});

const deleteNotification = asyncHandler(async function (req, res) {
    const notification = await notificationModel.findOneAndDelete(
        getNotificationFilter(req)
    );

    if (!notification) {
        throw new apiError(404, "Notification not found");
    }

    return res.status(200).json(
        new apiResponse(200, "Notification deleted successfully", notification)
    );
});

const deleteAllNotification = asyncHandler(async function (req, res) {
    const recipientId = getRecipientId(req);
    const result = await notificationModel.deleteMany({ recipientId });

    return res.status(200).json(
        new apiResponse(200, "Notifications deleted successfully", {
            deletedCount: result.deletedCount
        })
    );
});

export default {
    getAllNotifications,
    readNotification,
    deleteAllNotification,
    deleteNotification
};
