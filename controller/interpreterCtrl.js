const asyncHandler = require("express-async-handler");
const Interpreter = require("../models/interpreterModel");
const User = require("../models/userModel");
const createLog = require("../utils/loggerCtrl");
const Appointment = require("../models/appointmentModel");
const { generateUniqueUsername, autoGenPassword } = require('../config/genUsernameAndPassCtrl');
mongoose = require("mongoose");


// Api handles adding of new interpreter by the company admin ================

const createInterpreter = asyncHandler(async (req, res) => {
    try {

        const findUser = await User.findOne({email:req.body.email});
        const username = await generateUniqueUsername(req.body.fullname);
        const password = await autoGenPassword();
        if (!findUser) {
            const user = await User.create ({
                fullname: req.body.fullname,
                username,
                email: req.body.email,
                phone: req.body.phone,
                rosterID:req.body.rosterID,
                expirationDate:req.body.expirationDate,
                password:password,
                role : 'interpreter',
                createdBy : req.user,
            });
            createLog(req.user._id, "Add an interpreter", "success", `${req.user.username} successfully added a new interpreter with ID ${user._id}`);
            res.status(201).json({messaeg:`Interpreter successfully added, username is ${username} and password is ${password}`, role_details:user});
        } else {
            createLog(req.user._id, "Add an interpreter", "failed", `Error adding interpreter, ${req.body.email} already exist`);
            res.status(403).json({error:"Interpreter already exist"});
        }
        
    } catch (error) {
        createLog(req.user._id, "Add an interpreter", "failed", `Error adding interpreter`);
        res.status(400).json({message:"Error adding Interpreter", error:error.message});
    }
});


// Get all interpreters of the company ======================================

const getAllInterpreters = asyncHandler(async (req, res) => {
    
    const {id} = req.user;
    
    try{
        const interpreters = await User.find({createdBy:id, role:"interpreter"});
        if (! interpreters.length) {
            return res.status(400).json({error:"No interpreter yet for this company"});
        }
        const interpretersWithCompletedAppointment = await Promise.all(
            interpreters.map(async(interpreter) => {
                const completedAppointments = await Appointment.countDocuments({
                    interpreter:interpreter._id,
                    status:"completed",
                });
                return {
                    _id: interpreter._id,
                    fullname: interpreter.fullname,
                    email: interpreter.email,
                    phone: interpreter.phone,
                    role: interpreter.role,
                    completedAppointments,
                    rosterID: interpreter.rosterID,
                    expirationDate: interpreter.expirationDate,
                    status: interpreter.isActive ? "Active" : "Inactive"
                }
            })
        );
        res.status(200).json({interpreters:interpretersWithCompletedAppointment});
    } catch (error) {
        res.status(400).json({message: "Error fetching interpreters", error:error.message});
    }
});

module.exports = { createInterpreter, getAllInterpreters }