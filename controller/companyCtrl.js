const asyncHandler = require("express-async-handler");
const Company = require("../models/companyModel");
const User = require("../models/userModel");
const validateMongoDbId = require("../utils/validateMongoDbId");



// ADD NEW COMPANY BY SUPERUSER =======================================
const createCompany = asyncHandler(async (req, res) => {
    try {
        const findCompany = Company.findOne({email:req.body.email});
        if (findCompany) {
            return res.status(403).json({error:"company email is already in use"});
        }
        const findUser = User.findOne({email:req.body.email});
        if (findUser) {
            return res.status(403).json({error:"User email is already in use"});
        }
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
        res.status(500).json({message:"There is an error adding companny",});
    }
});

// update company by company or and superuser ==========================================

const updateCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = req.user.id;
    validateMongoDbId(id);
    console.log({signedinadmin:user})
    const { name, email, phone, address, } = req.body;
    try {
        findCompany =  await Company.findById(id)
        console.log({admin:findCompany.admin});
        if (user.toString() !== findCompany.admin.toString()) {
            return res.status(403).json({error:"Not authorized"})
        }
        const company = await Company.findByIdAndUpdate(id,{
            name:name,
            email:email,
            phone:phone,
            address:address,
        },
        {new:true}
        );
        res.status(200).json({message:"Company name successfully updated", 
        updated_company:company});
    } catch (error) {
        res.status(400).json({error:"could could not find company to update"})
    }
});

// Retrieve list of all company ==========================================

const getAllCompanies = asyncHandler(async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json({companies:companies});

    } catch(error) {
        res.status(500).json({error:"Error fetching all companies"})
    }
});

// Count the  toal number of comapanies =======================================

const totalCompanies = asyncHandler(async (req, res) => {
    try {
        const companies = await Company.countDocuments();
        res.status(200).json({total:companies});

    } catch(error) {
        res.status(500).json({error:"Error fetching total"});
    }
});

// Retrieves a company by it's ID ====================================

const getACompany = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const company = await Company.findById(id);
        res.status(200).json({company:company})
    } catch (error) {
        res.status(500).json({error:"Error fetching company"})
    }
});



const activateCompany = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const activatedCompany = await Company.findByIdAndUpdate(id, {
            isActive : true
        },{
            new:true
        });
        res.json (activatedCompany);
    } catch (error) {
        throw new Error(error);
    }
});

const deactivateCompany = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const deactivated = await Company.findByIdAndUpdate(id, {
            isActive : false,
        },{
            new:true,
        });
        res.json(deactivated);
    } catch (error) {
        throw new Error(error);
    }
});



module.exports = {
    createCompany, 
    totalCompanies, 
    getAllCompanies, 
    updateCompany,
    getACompany,
    activateCompany,
    deactivateCompany,
}