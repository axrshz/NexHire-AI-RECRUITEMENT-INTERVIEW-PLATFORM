import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
        required: true
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewSession",
        required: true,
        unique: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    overallScore: {
        type: Number,
        min: 0,
        max: 100
    },
    technicalScore: {
        type: Number,
        min: 0,
        max: 100
    },
    communicationScore: {
        type: Number,
        min: 0,
        max: 100
    },
    problemSolvingScore: {
        type: Number,
        min: 0,
        max: 100
    },
    strengths: {
        type: [String],
        default: []
    },
    weaknesses: {
        type: [String],
        default: []
    },
    recommendations: {
        type: [String],
        default: []
    },
    recruiterNotes: {
        type: String,
        trim: true
    },
    recruiterDecision: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

evaluationSchema.index({ interviewId: 1, candidateId: 1 });

const evaluationModel = mongoose.model("Evaluation", evaluationSchema);

export default evaluationModel;
