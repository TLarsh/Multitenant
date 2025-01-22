const asyncHandler = require("express-async-handler");
const companyModel = require("../models/companyModel");


const createCompany = asyncHandler(async (req, res) => {
    try {
        const newCompany = await companyModel.create({...req.body, created_by:'admin'});
        res.status(200).json({newCompany});
    } catch (error) {
        throw new Error(error);
    }
});



const getAllCompanies = asyncHandler(async (req, res) => {
    try {
        const companies = await companyModel.find();
        res.status(200).json({companies:companies})

    } catch(error) {
        throw new Error(error)
    }
});

const totalCompanies = asyncHandler(async (req, res) => {
    try {
        const companies = await companyModel.countDocuments();
        res.status(200).json({total:companies})

    } catch(error) {
        throw new Error(error)
    }
});

module.exports = {createCompany, totalCompanies, getAllCompanies}