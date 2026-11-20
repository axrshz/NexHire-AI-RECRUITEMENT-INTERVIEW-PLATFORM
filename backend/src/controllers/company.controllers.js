import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import uploadFile from "../utils/cloudinary.js";
import companyModel from "../models/company.model.js";
import companyMemberModel from "../models/companyMember.model.js";
import mongoose from "mongoose";



const createCompany = asyncHandler(async (req, res) => {
    const { name, website, industry, description } = req.body;
    const userId = req.user?._id;

    if (!name || !website || !industry || !description) {
        throw new apiError(400, "Name, website, industry, and description are required");
    }

    // Check if company already exists by name or website
    const existingCompany = await companyModel.findOne({
        $or: [{ name: name.trim() }, { website: website.trim() }]
    });

    if (existingCompany) {
        throw new apiError(400, "A company with this name or website already exists");
    }

    // Handle company logo (via multer file upload or body URL)
    let logoUrl = "";
    if (req.file) {
        const uploadResult = await uploadFile(req.file.path);
        if (!uploadResult || !uploadResult.url) {
            throw new apiError(500, "Failed to upload company logo");
        }
        logoUrl = uploadResult.url;
    }


    // Create Company
    const company = await companyModel.create({
        name: name.trim(),
        website: website.trim(),
        industry: industry.trim(),
        description: description.trim(),
        logo: req.file ? logoUrl : "",
        createdBy: userId
    });

    // Create CompanyMember entry as "owner"
    const membership = await companyMemberModel.create({
        userId,
        companyId: company._id,
        role: "owner",
        designation: "Founder / Lead Recruiter",
        status: "active"
    });

    return res.status(201).json(
        new apiResponse(201, "Company registered successfully", {
            company,
            membership
        })
    );
});



const joinCompany = asyncHandler(async (req, res) => {
    const { designation } = req.body;
    const companyId = req.params.companyId;
    const userId = req.user?._id;

    if (!companyId) {
        throw new apiError(400, "Company ID is required to join");
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new apiError(400, "Invalid Company ID format");
    }

    // Check if target company exists
    const company = await companyModel.findById(companyId);
    if (!company) {
        throw new apiError(404, "Company not found");
    }

    // Check if user is already a member
    const existingMember = await companyMemberModel.findOne({
        userId,
        companyId
    });

    if (existingMember) {
        throw new apiError(400, `You are already a member of this company (status: ${existingMember.status})`);
    }

    // Create new membership record
    const membership = await companyMemberModel.create({
        userId,
        companyId,
        role: "recruiter",
        designation: designation || "Recruiter",
        status: "active"
    });

    return res.status(200).json(
        new apiResponse(200, "Joined company successfully", {
            company: {
                _id: company._id,
                name: company.name,
                logo: company.logo,
                industry: company.industry,
                website: company.website
            },
            membership
        })
    );
});



const listCompanies = asyncHandler(async (req, res) => {
    const search = req.body?.search;

    const regex = new RegExp(search.trim(), "i")

    const companies = await companyModel.aggregate([
        {
            $match: { name: { $regex: regex } }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                logo: 1,
                website: 1,
                industry: 1
            }
        }
    ]);

    return res.status(200).json(
        new apiResponse(200, "Companies fetched successfully", companies)
    );
});



const getMyCompany = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const membership = await companyMemberModel
        .findOne({ userId })
        .populate("companyId");

    if (!membership) {
        return res.status(200).json(
            new apiResponse(200, "No company associated with this account yet", null)
        );
    }

    return res.status(200).json(
        new apiResponse(200, "Company details retrieved", membership)
    );
});



const addCompanyLogo = asyncHandler(async (req, res) => {
    const companyId = req.params.companyId 
    const userId = req.user?._id;

    if (!companyId) {
        throw new apiError(400, "Company ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new apiError(400, "Invalid Company ID format");
    }

    const company = await companyModel.findById(companyId);
    if (!company) {
        throw new apiError(404, "Company not found");
    }

    // Verify user is company creator or owner
    const isCreator = company.createdBy.toString() === userId.toString();
    const membership = await companyMemberModel.findOne({
        userId,
        companyId,
        status: "active"
    });

    if (!isCreator && (!membership || membership.role !== "owner")) {
        throw new apiError(403, "You do not have permission to update this company's logo");
    }

    if (!req.file) {
        throw new apiError(400, "Logo image file is required");
    }

    const uploadResult = await uploadFile(req.file.path);
    if (!uploadResult || !uploadResult.url) {
        throw new apiError(500, "Failed to upload logo to Cloudinary");
    }

    company.logo = uploadResult.url;
    await company.save();

    return res.status(200).json(
        new apiResponse(200, "Company logo uploaded successfully", company)
    );
});

export default {
    createCompany,
    joinCompany,
    listCompanies,
    getMyCompany,
    addCompanyLogo
};
