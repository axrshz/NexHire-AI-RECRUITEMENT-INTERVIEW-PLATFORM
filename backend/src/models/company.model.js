import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    website: {
        type: String,
        required: [true, "Website is required"],
        trim: true
    },
    industry: {
        type: String,
        required: [true, "Industry is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    },
    logo: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
}, {
    timestamps: true
});

const companyModel = mongoose.model("Company", companySchema);

export default companyModel;
