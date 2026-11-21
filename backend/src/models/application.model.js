import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    resumeUrl: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

applicationSchema.index({ candidateId: 1, appliedAt: -1 });
applicationSchema.index({ jobId: 1, status: 1 });

const applicationModel = mongoose.model("Application", applicationSchema);

export default applicationModel;
