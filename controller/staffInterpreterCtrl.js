const asyncHandler = require("express-async-handler");
const Appointment = require("../models/appointmentModel");
const Client = require("../models/clientModel");
const Interpreter = require("../models/interpreterModel");
const User = require("../models/userModel");


// count total staff and interpreter for the company
const countStaffAndInterpreter = asyncHandler(async (req, res) => {
    const { id } = req.user;
    try {
        const countStaff = await User.countDocuments({createdBy:id,
        role: "staff"});
        const countInterpreter = await User.countDocuments({createdBy:id,
        role: "interpreter"});
        const total = countStaff + countInterpreter 
        res.status(200).json({
            staffs:countStaff,
            interpreters:countInterpreter,
            total:total,
        });
    } catch (error) {
        res.status(500).json({error: "Error counting staffs and interpreters"});
    }
});

// Count all staffs and interpreters =========================================

const overallStaffAndInterpreter = asyncHandler(async (req, res) => {
    
    try {
        const countStaff = await User.countDocuments({
        role: "staff"});
        const countInterpreter = await User.countDocuments({
        role: "staff"});
        const total = countStaff + countInterpreter
        res.status(200).json({
            staffs:countStaff,
            interpreters:countInterpreter,
            total:total,
        });
    } catch (error) {
        res.status(500).json({err: "Error counting staffs and interpreters", error});
    }
});

module.exports = { countStaffAndInterpreter, overallStaffAndInterpreter };