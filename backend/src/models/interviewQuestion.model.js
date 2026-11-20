import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
        required: true
    },
    questionNumber: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: "Question number must be an integer"
        }
    },
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    expectedTopics: {
        type: [String],
        default: []
    },
    timeLimit: {
        type: Number,
        min: 1
    },
    starterCode: {
        type: String
    },
    testCases: {
        type: String
    }
}, {
    timestamps: true
});

interviewQuestionSchema.index({ interviewId: 1, questionNumber: 1 }, { unique: true });

const interviewQuestionModel = mongoose.model("InterviewQuestion", interviewQuestionSchema);

export default interviewQuestionModel;
