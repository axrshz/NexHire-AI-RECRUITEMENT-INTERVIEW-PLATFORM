import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        default: "pending",
        trim: true
    },
    currentQuestionIndex: {
        type: Number,
        default: 0,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: "Current question index must be an integer"
        }
    },
    startedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

interviewSessionSchema.index({ interviewId: 1, candidateId: 1 });
interviewSessionSchema.index({ candidateId: 1, status: 1 });

const interviewSessionModel = mongoose.model("InterviewSession", interviewSessionSchema);

export default interviewSessionModel;
