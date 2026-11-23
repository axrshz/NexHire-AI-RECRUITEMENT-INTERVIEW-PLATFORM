import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "User ID is required"],
        unique: true
    },
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true
    },
    education: {
        type: String,
        trim: true,
        default: ""
    },
    experience: {
        type: String,
        trim: true,
        default: ""
    },
    skills: {
        type: [String],
        default: []
    },
    resumeUrl: {
        type: String,
        trim: true,
        default: ""
    },
    preferredRole: {
        type: String,
        trim: true,
        default: ""
    }
}, {
    timestamps: true
});

const candidateModel = mongoose.model("CandidateProfile", candidateSchema);

export default candidateModel;
