const asyncHandler = require("express-async-handler");
const { generateVisitationId } = require("../config/visitationId");
const Appointment = require("../models/appointmentModel");
const Timesheet = require("../models/timesheetModel");
const User = require("../models/userModel");

// interpreter clocks In  =====================================================

const createTimesheet = asyncHandler(async(req, res) => {
    const {appointmentId, date} = req.body;
    const interpreterId = req.user.id;
    console.log(interpreterId)
    try {
        const appointment = await Appointment.findOne({_id:appointmentId});
        const existingEntry = await Timesheet.findOne({ appointmentId: appointmentId, interpreter: interpreterId, clockOut: null });
        if (interpreterId.toString() !== appointment.interpreter.toString()) {
            return res.status(401).json({error:"Not authorized"})
        }
        if (existingEntry) {
            return res.status(400).json({ message: "You have already clocked in for this appointment." });
        }
        const newTimesheet = await Timesheet.create({
            appointmentId,
            interpreter:interpreterId,
            visitationId: generateVisitationId(appointmentId),
            date : new Date(date),
            clockIn : new Date(),
        });
        console.log(newTimesheet)
        // await newTimesheet.save();
        res.status(201).json({message: "Timesheet successfully created", 
        timesheet: newTimesheet});
    } catch (error) {
        res.status(500).json({error:error.message});
    }
});


// get timesheets by appointmentId, predefined periods and custom filters by date range

const getTimesheets = async (req, res) => {
    try {
        const companyId = req.user
        let { filter, appointmentId, startDate, endDate } = req.query;
        let query = {};

        // const findCreatedBy = await Appointment.findById(appointmentId);
        // const createdBy = findCreatedBy.createdBy;
        // console.log({createdBy:createdBy})
        if (!companyId){
            return res.status(403).json({error:"Not authorized, no company Id associated"})
        }
        // find all interpreters belonging to the logged in company
        const companyInterpreters = await User.find({ 
            createdBy:companyId,
            role:"interpreter"
        }).select("_id");

        const interpretersIds = companyInterpreters.map((interpreter) => interpreter._id);
        query.interpreter = { $in:interpretersIds }; //restricts timesheets to just company interpre5ters

        if (appointmentId) {
            query.appointmentId = appointmentId;
        }

        const now = new Date();

        // Filter by predefined periods
        if (filter === "day") {
            query.clockIn = {
                $gte: new Date(now.setHours(0, 0, 0, 0)), // Start of the day
                $lt: new Date(now.setHours(23, 59, 59, 999)), // End of the day
            };
        } else if (filter === "week") {
            const startOfWeek = new Date();
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            query.clockIn = { $gte: startOfWeek, $lt: endOfWeek };
        } else if (filter === "month") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            query.clockIn = { $gte: startOfMonth, $lt: endOfMonth };
        }

        // Filter by custom date range
        if (startDate && endDate) {
            query.clockIn = {
                $gte: new Date(startDate),
                $lt: new Date(new Date(endDate).setHours(23, 59, 59, 999)), // End of the selected day
            };
        }

        // const timesheets = await Timesheet.find(query)
        const timesheets = await Timesheet.find(query)
        .populate("interpreter", "_id role")
        .populate("appointmentId", "_id");
        
        res.json({ timesheets });
    } catch (error) {
        res.status(500).json({ message: "Error fetching timesheets", error: error.message });
    }
};

// clock out===========================================================

const clockOut = asyncHandler (async (req, res) => {
    const {timesheetId} = req.params;
    const interpreterId = req.user.id
    console.log(timesheetId)
    try {
        const timesheet = await Timesheet.findOne({_id:timesheetId, interpreter:interpreterId});
        if (!timesheet) {
            return res.status(404).json({error:"Timesheet not found"});
        }
        if (timesheet.clockOut) {
            return res.status(400).json({ message: "You have already clocked out." });
        }
        timesheet.clockOut = new Date();
        timesheet.duration = Math.round((timesheet.clockOut - timesheet.clockIn) / (1000 * 60));
        await timesheet.save();
        res.status(200).json({message:"Clock-out time successfully updated", timesheet})
    } catch (error) {
        res.status(500).json({error:error.message})
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
