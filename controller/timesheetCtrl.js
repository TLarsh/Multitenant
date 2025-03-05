const asyncHandler = require("express-async-handler");
const { generateVisitationId } = require("../config/visitationId");
const Appointment = require("../models/appointmentModel");
const Timesheet = require("../models/timesheetModel");
const sendNotification = require("../utils/firebase");
const createLog = require("../utils/loggerCtrl");
const { getFirestore } = require ("firebase-admin/firestore");
const validateMongoDbId = require("../utils/validateMongoDbId");
const User = require("../models/userModel");

// Clock in by interpreter  =====================================================

const createTimesheet = asyncHandler(async(req, res) => {
    const {appointmentId, date} = req.body;
    const interpreterId = req.user.id;
    try {
        const appointment = await Appointment.findOne({_id:appointmentId});
        const existingEntry = await Timesheet.findOne({ appointmentId: appointmentId, interpreter: interpreterId, clockOut: null });
        if (interpreterId.toString() !== appointment.interpreter.toString()) {
            createLog(
                interpreterId,
                "Signin timesheet",
                "failed",
                `Signin timesheet failed to ${req.user.username}, not authorized`
              );
        
            return res.status(401).json({error:"Not authorized"})
        }
        if (existingEntry) {
            createLog(
                interpreterId,
                "Signin timesheet",
                "failed",
                `Signin timesheet failed to ${req.user.username}, signed in already`
              );
            return res.status(400).json({ message: "You have already clocked in for this appointment." });
        }
        const newTimesheet = await Timesheet.create({
            appointmentId,
            interpreter:interpreterId,
            staff: appointment.staff,
            client: appointment.client,
            visitationId: generateVisitationId(appointmentId),
            date : new Date(date),
            clockIn : new Date(),
        });
        createLog(
            interpreterId,
            "Signin timesheet",
            "success",
            `${req.user.username}, signed timesheet for appointment with ID ${appointmentId}`
          );
        res.status(201).json({message: "Timesheet successfully created", 
        timesheet: newTimesheet});
    } catch (error) {
        createLog(
            interpreterId,
            "Signin timesheet",
            "failed",
            `Signin timesheet failed to ${req.user.username}`
          );
        res.status(500).json({error:error.message});
    }
});


// Get timesheets by appointmentId, predefined periods and custom filters by date range

const getTimesheets = async (req, res) => {
    try {
        const companyId = req.user
        let { filter, appointmentId, startDate, endDate } = req.query;
        let query = {};

        // const findCreatedBy = await Appointment.findById(appointmentId);
        // const createdBy = findCreatedBy.createdBy;
        // console.log({createdBy:createdBy})
        if (!companyId){
            return res.status(403).json({error:"Not authorized, no company Id associated"});
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
            endOfWeek.setDate(startOfWeek.getDate() + 14);
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
        .populate("interpreter", "_id fullname username role")
        .populate("staff", "_id fullname username role")
        .populate("client", "_id fullname username role")
        .populate("appointmentId", "_id");
        
        res.json({ timesheets });
    } catch (error) {
        res.status(500).json({ message: "Error fetching timesheets", error: error.message });
    }
};

// Clock out by interpreter ===========================================================

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
            createLog(
                interpreterId,
                "Timesheet clockout",
                "failed",
                `Timesheet clockout failed to ${req.user.username}, already clocked out.`
              );
            return res.status(400).json({ message: "You have already clocked out." });
        }
        // save changes in timesheet//
        timesheet.clockOut = new Date();
        timesheet.reason = req.body.reason;
        timesheet.duration = Math.round((timesheet.clockOut - timesheet.clockIn) / (1000 * 60 * 60));
        await timesheet.save();
        createLog(
            interpreterId,
            "Timesheet clockout",
            "success",
            `Timesheet clockout failed to ${req.user.username}, not authorized`
          );
        res.status(200).json({message:"Clock-out time successfully updated", timesheet})
    } catch (error) {
        createLog(
            interpreterId,
            "Timesheet clockout",
            "failed",
            `Timesheet clockout failed to ${req.user.username}.`
          );
        res.status(500).json({error:error.message})
    }
});

// Delete timesheet =======================================

const deleteTimesheet = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const deletedTimesheet = await Timesheet.findByIdAndDelete(id);
        createLog(
            req.user._id,
            "Delete timehseet",
            "success",
            `${req.user.username} successfully deleted a timesheet with ID ${id}`
          );
        res.status(200).json({message:"Timesheet deleted successfully", deletedTimesheet});
    } catch (error) {
        createLog(
            req.user._id,
            "Delete timehseet",
            "failed",
            `Delete timesheet failed to ${req.user.username}`
          );
        throw new Error(error);
    }
});

// ================ Approve timesheet ==================================

const approveTimesheet = asyncHandler (async ( req, res ) => {
    const { timesheetId } = req.params;
    validateMongoDbId(timesheetId);
    try {
      findTimesheet = await Timesheet.findOne({_id:timesheetId});
      if ( !findTimesheet ) return res.status(404).json("Timesheet not found");
      const approvedTimesheet = await Timesheet.findByIdAndUpdate(
        timesheetId,
        {
          status: "approved",
        },
        {new: true}
      );
      res.status(200).json({message: "Timesheet approved", approvedTimesheet});
    } catch (error) {
      throw new Error (error);
    }
  });

  // ================ Reject timesheet ==================================
  
  const rejectTimesheet = asyncHandler (async ( req, res ) => {
    const { timesheetId } = req.params;
    validateMongoDbId(timesheetId);
    try {
      findTimesheet = await Timesheet.findOne({_id:timesheetId});
      if ( !findTimesheet ) return res.status(404).json("Timesheet not found");
      const rejectedTimesheet = await Timesheet.findByIdAndUpdate(
        timesheetId,
        {
          status: "rejected",
        },
        {new: true}
      );
      res.status(200).json({message: "Timesheet rejected", rejectedTimesheet});
    } catch (error) {
      throw new Error (error);
    }
  });



// Send message reminder for clock-in and clock-out =======================

const sendClockInReminder = async ( req, res ) => {
    const {interpreterId} = req.params;
    const interpreter = await User.findById(interpreterId);
    const db = getFirestore();

    if (interpreter?.fcmToken) {
        // console.log({interpreter:interpreter})
        // sendNotification(interpreter.fcmToken, "Clock-In Reminder", "Don't forget to clock in!");
        try {
            const { title, body } = req.body;

            const messageData = {
                senderId : req.user.id,
                receiverId : interpreterId,
                body,
                timestamp: new Date(),
                isRead: false,
            };
            // Save message in Firestore
            const docRef = await db.collection("messages").add(messageData);

            const message = {
              token: interpreter.fcmToken,
              notification: {
                title: title,
                body: body,
              },
              data: { messageId: docRef.id },
            };
        
            const response = await messaging.send(message);
            res.json({ success: true, response });
          } catch (error) {
            res.status(500).json({ success: false, error: error.message });
          }
    } else {
        return res.status(400).json({error:"No fcm token found for user"});
    }
};



// Check unread messages ========================

const unreadMessages = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const messagesRef = db.collection("messages");
      const snapshot = await messagesRef.where("receiverId", "==", userId).where("isRead", "==", false).get();
  
      if (snapshot.empty) {
        return res.json({ success: true, messages: [] });
      }
  
      const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.json({ success: true, messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve unread messages", error });
    }
};

// Mark mesage as read ===============================

const markAsRead = async (req, res) => {
    const { messageId } = req.params;
  
    try {
      const messageRef = db.collection("messages").doc(messageId);
      await messageRef.update({ isRead: true });
  
      res.json({ success: true, message: "Message marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read", error });
    }
};
  





module.exports = {
    createTimesheet,
    getTimesheets,
    clockOut,
    deleteTimesheet,
    approveTimesheet,
    rejectTimesheet,
    sendClockInReminder,
    unreadMessages,
    markAsRead,
};
