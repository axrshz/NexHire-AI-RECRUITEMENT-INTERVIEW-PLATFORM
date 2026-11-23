import notificationModel from "../models/notification.model.js";

const getAllNotifications = async (recipientId) => {
    const notifications = await notificationModel.find({ recipientId })
        .sort({ createdAt: -1, _id: -1 });
    return notifications;
};

const readNotification = async (notificationId, recipientId) => {
    const notification = await notificationModel.findOneAndUpdate(
        { _id: notificationId, recipientId },
        { $set: { isRead: true } },
        { new: true, runValidators: true }
    );
    return notification;
};

const deleteNotification = async (notificationId, recipientId) => {
    const notification = await notificationModel.findOneAndDelete({
        _id: notificationId,
        recipientId
    });
    return notification;
};

const deleteAllNotification = async (recipientId) => {
    const result = await notificationModel.deleteMany({ recipientId });
    return result;
};

export default {
    getAllNotifications,
    readNotification,
    deleteNotification,
    deleteAllNotification
};
