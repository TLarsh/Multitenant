const expressAsyncHandler = require("express-async-handler");
const Appointment = require("../models/appointmentModel");

const isConflictExist = expressAsyncHandler(async(interpreterId, staffId, clientId, startTime, endTime) => {
    try {
        const conflict = await Appointment.findOne({
            $or: [
                { interpreter: interpreterId },
                { staff: staffId },
                { client: clientId }
            ],
            $or: [
                { time : {$gte: startTime, $lt: endTime} },
                { endTime : {$gt: startTime, $lte: endTime} },
                // { time: {$lte: startTime}, endTime: {gte:endTime} }
            ]
        });
        return !! conflict; //returns true if conflict else false
    } catch (error) {
        console.error("error detecting appointment conflict"); 
        return false;
        // throw new Error({message: "Conflict detect logic failed", error:error.message});
    }
});

module.exports = isConflictExist;