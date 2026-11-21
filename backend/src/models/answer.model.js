import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewSession",
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewQuestion",
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    answerType: {
        type: String,
        required: true,
        trim: true
    },
    videoStorageUrl: {
        type: String,
        trim: true
    },
    audioTranscript: {
        type: String
    },
    writtenText: {
        type: String
    },
    submittedCode: {
        type: String
    },
    codeLanguage: {
        type: String,
        trim: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

answerSchema.index({ sessionId: 1, questionId: 1 }, { unique: true });

const answerModel = mongoose.model("Answer", answerSchema);

export default answerModel;
