import express from "express";
import companyControllers from "../controllers/company.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";

const route = express.Router();

// List / search companies
route.get("/companies", companyControllers.listCompanies);

// Get logged-in recruiter's company
route.get("/my-company", authMiddleware, companyControllers.getMyCompany);

// Create new company
route.post("/create", authMiddleware, upload.single("logo"), companyControllers.createCompany);

// Join existing company
route.post("/join/:companyId", authMiddleware, companyControllers.joinCompany);

export default route;
