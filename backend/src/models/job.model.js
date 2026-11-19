import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Job title is required"]
    },
    description: {
        type: String,
        required: [true, "Job description is required"]
    },
    experience: {
        type: String,
        required: [true, "Experience is required"]
    },
    location: {
        type: String,
        required: [true, "Location is required"]
    },  
    salary: {
        type: String,
        required: [true, "Salary is required"]
    },
    status: {
        type: String,
        enum: ['Open', 'Closed'],
        required: [true, "Job status is required"]
    },
    requiredSkills: {
        type: [String],
        required: [true, "Required skills are required"]
    },
    vacancies: {
        type: Number,
        required: [true, "Number of vacancies is required"]
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
        required: true
    },
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {
    timestamps: true
})

const jobModel = mongoose.model("Job", jobSchema)

export default jobModel;