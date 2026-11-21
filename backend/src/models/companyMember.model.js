import mongoose from "mongoose";

const companyMemberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    role: {
        type: String,
        enum: ["owner", "recruiter", "member"],
        default: "recruiter"
    },
    designation: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["active", "pending", "rejected"],
        default: "active"
    }
}, {
    timestamps: true
});

companyMemberSchema.index({ userId: 1, companyId: 1 }, { unique: true });

const companyMemberModel = mongoose.model("CompanyMember", companyMemberSchema);

export default companyMemberModel;
