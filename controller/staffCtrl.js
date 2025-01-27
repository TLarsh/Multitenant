const asyncHandler = require("express-async-handler");
const Staff = require("../models/staffModel");
const User = require("../models/userModel");

const addStaff = asyncHandler(async (req, res) => {
    try {
        const staff = await Staff.create({...req.body, createdBy:req.user})
        const user = await User.create({
            ...req.body,
            role : 'staff',
            
        });
        res.status(200).json({message:"Staff successfully created", staff:staff, role_detail:user})
    } catch (error) {
        res.status(500).json({error: "Error adding staff"});
    }
});


module.exports = { addStaff, }
