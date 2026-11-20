import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    website: {
        type: String,
        required: [true, "Website is required"]
    },
    industry: {
        type: String,
        required: [true, "Industry is required"]
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    logo: {
        type: String,
        required: [true, "Logo is required"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true

})

const recruiterModel = mongoose.model("Recruiter", recruiterSchema)

export default recruiterModel