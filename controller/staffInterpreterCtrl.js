const asyncHandler = require("express-async-handler");
const Appointment = require("../models/appointmentModel");
const Client = require("../models/clientModel");
const Interpreter = require("../models/interpreterModel");
const User = require("../models/userModel");


// count total staff and interpreter for the company
const countStaffAndInterpreter = asyncHandler(async (req, res) => {
    const { id } = req.user;
    try {
        const countTotal = await User.countDocuments({createdBy:id,
        role: {$in: ["staff", "interpreter"]}});
        res.status(200).json({total:countTotal})
    } catch (error) {
        res.status(500).json({error: "Error counting staffs and interpreters"});
    }
});

const overallStaffAndInterpreter = asyncHandler(async (req, res) => {
    
    try {
        const countTotal = await User.countDocuments({
        role: {$in: ["staff", "interpreter"]}});
        res.status(200).json({total:countTotal})
    } catch (error) {
        res.status(500).json({error: "Error counting staffs and interpreters"});
    }
});

module.exports = { countStaffAndInterpreter, overallStaffAndInterpreter };