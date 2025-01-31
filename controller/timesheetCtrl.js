const asyncHandler = require("express-async-handler");
const Timesheet = require("../models/timesheetModel");

const createTimesheet = asyncHandler(async(req, res) => {
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
        res.status(500).json({error:"Error creating timesheet"});
    }
});

// get all timesheets
const getTimesheets = asyncHandler(async (req, res) => {
    console.log(req.user);
    const { timeframe } = req.query;

  
    // if (!name) {
    //   return res.status(400).json({ error: "Could not get company name" });
    // }
  
    let dateFilter = {};
  
    // Filter by timeframe
    if (timeframe) {
      const now = new Date();
      switch (timeframe) {
        case "12months":
          dateFilter = { timestamp: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
          break;
        case "30days":
          dateFilter = { timestamp: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
          break;
        case "7days":
          dateFilter = { timestamp: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
          break;
        case "24hours":
          dateFilter = { timestamp: { $gte: new Date(now.setDate(now.getDate() - 1)) } };
          break;
        case "alltime":
        default:
          dateFilter = {}; // No filter for all time
          break;
      }
    }
    

  
    // const query = name
    // console.log({"query":query})
    try {
        const timesheets = await Timesheet.find({...dateFilter}).sort({ timestamp: -1});
        // .populate("appointmentId", "note date");
        res.status(200).json(timesheets);
    } catch (error) {
        res.status(500).json({error:"Error fetching timesheets"});
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
        res.status(500).json({error:"Error updating clock out time"})
    }
});

const deleteTimesheet = asyncHandler(async(req, res) => {
    const {id} = req.params;
    
    console.log(id)
})





module.exports = {
    createTimesheet,
    getTimesheets,
    clockOut,
}
