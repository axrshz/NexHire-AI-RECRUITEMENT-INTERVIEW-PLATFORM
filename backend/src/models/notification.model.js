import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    actionUrl: {
        type: String,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const notificationModel = mongoose.model("Notification", notificationSchema);

export default notificationModel;
