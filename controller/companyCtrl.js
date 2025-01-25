const asyncHandler = require("express-async-handler");
const Company = require("../models/companyModel");
const User = require("../models/userModel");

// ADD NEW COMPANY BY SUPERUSER
const createCompany = asyncHandler(async (req, res) => {
    try {
        const newCompany = await Company.create({...req.body, createdBy:req.user});
        const admin = await User.create({
            username : req.body.admin_username,
            email : req.body.email,
            phone :  req.body.phone,
            password : req.body.admin_password,
            role : 'company_admin',
            createdBy : req.user
        });
        await Company.findByIdAndUpdate(newCompany.id,{
            admin : admin.id
        }, {new:true});
        res.status(200).json({message:'company successfully created',company:newCompany, role_details:admin});
    } catch (error) {
        throw new Error(error);
    }
});



const getAllCompanies = asyncHandler(async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json({companies:companies})

    } catch(error) {
        throw new Error(error)
    }
});

const totalCompanies = asyncHandler(async (req, res) => {
    try {
        const companies = await Company.countDocuments();
        res.status(200).json({total:companies})

    } catch(error) {
        throw new Error(error)
    }
});

module.exports = {createCompany, totalCompanies, getAllCompanies}