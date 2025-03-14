const asyncHandler = require("express-async-handler");
const Staff = require("../models/staffModel");
const User = require("../models/userModel");
const Appointment = require("../models/appointmentModel");
const createLog = require("../utils/loggerCtrl");
const { generateUniqueUsername, autoGenPassword } = require('../config/genUsernameAndPassCtrl');

const addStaff = asyncHandler(async (req, res) => {
    try {

        const findUser = await User.findOne({email:req.body.email});
        const username = await generateUniqueUsername(req.body.fullname);
        const password = await autoGenPassword();
        if (!findUser) {
            const user = await User.create ({
                ...req.body,
                username,
                password:password,
                role : 'staff',
                createdBy : req.user,
            });
            createLog(req.user._id, "Add a staff", "success", `${req.user.username} successfully added a new staff with ID ${user._id}`);
            res.status(201).json({messaeg:`Staff successfully added, username is ${username} and password is ${password}`, role_details:user});
        } else {
            createLog(req.user._id, "Add a staff", "failed", `Error adding staff, ${req.body.email} already exist`);
            res.status(403).json({error:"Staff already exist"});
        }
        
    } catch (error) {
        createLog(req.user._id, "Add a staff", "failed", `Error adding staff.`);
        res.status(400).json(error.message);
    }
});


// get all staffs of the company
const getAllStaffs = asyncHandler(async (req, res) => {
    
    const {id} = req.user;
    
    try{
        const staffs = await User.find({createdBy:id, role:"staff"});
        if (! staffs.length) {
            return res.status(400).json({error:"No staff yet for this company"});
        }
        const staffsWithCompletedAppointment = await Promise.all(
            staffs.map(async(staff) => {
                const completedAppointments = await Appointment.countDocuments({
                    staff:staff._id,
                    status:"completed",
                });
                return {
                    _id: staff._id,
                    fullname: staff.fullname,
                    email: staff.email,
                    phone: staff.phone,
                    role: staff.role,
                    completedAppointments,
                    status: staff.isActive ? "Active" : "Inactive"
                }
            })
        );
        res.status(200).json({staffs:staffsWithCompletedAppointment});
    } catch (error) {
        res.status(400).json({message: "Error fetching staffs", error:error.message});
    }
});



module.exports = { addStaff, getAllStaffs };
