const asyncHandler = require("express-async-handler");
const Timesheet = require("../models/Timesheet");

const createTimesheet = expressAsyncHandler(async(req, res) => {
    const {appointmentId, clockIn, clockOut, date, reason} = req.body;

    try {
        const newTimesheet = new Timesheet({
            appointmentId,
            clockIn: new Date(clockIn),
            clockOut: clockOut ? new Date(clockOut): null,
            date,
            reason,
        });
        await newTimesheet.save();
        res.status(201).json({message: "Timesheet successfully created", 
        timesheet: newTimesheet});
    } catch (error) {
        throw new Error(error);
    }
});

// get all timesheets
const getTimesheets = asyncHandler(async (req, res) => {
    try {
        const timesheets = await Timesheet.find()
        .populate("appointmentId", "details date");
        res.status(200).json(timesheets);
    } catch (error) {
        throw new Error(error);
    }
});

const clockOut = asyncHandler (async (req, res) => {
    const {timesheetId} = req.params;
    const {clockOut} = req.body;
    try {
        const timesheet = await Timesheet.findById(timesheetId);
        if (!timesheet) {
            return res.status(404).json({error:"Timesheet not found"});
        }
        timesheet.clockOut = new Date(clockOut);
        await timesheet.save();
        res.status(200).json({message:"Clock-out time successfully updated", timesheet})
    } catch (error) {
        throw new Error(error)
    }
});

