const asyncHandler = require("express-async-handler");
const Staff = require("../models/staffModel");
const User = require("../models/userModel");

const addStaff = asyncHandler(async (req, res) => {
    try {
        const staff = await Staff.create({...req.body, createdBy:req.user})
        const user = await User.create({
            ...req.body,
            role : 'staff',
            company : req.user
        });
        res.status(200).json({message:"Staff successfully created", staff:staff, role_detail:user})
    } catch (error) {
        throw new Error(error)
    }
});


module.exports = { addStaff, }
asyncHandler