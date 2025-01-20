const asyncHandler = require("express-async-handler");
const appointmentModel = require("../models/appointmentModel");


const createAppointment = asyncHandler(async (req, res) => {
    try {
        const newAppointment = await appointmentModel.create(req.body);
        res.status(201).json({newAppointment});
    } catch (error) {
        throw new Error(error);
    }
});

const totalAppointments = asyncHandler (async (req, res) => {
    
    try {
        const appointments = await appointmentModel.count();
        res.status(200).json({total : appointments});
    } catch (error) {
        throw new Error(error);
    };
});


module.exports = {
    createAppointment,
    totalAppointments,
}