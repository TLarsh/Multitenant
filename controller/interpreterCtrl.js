const asyncHandler = require("express-async-handler");
const Interpreter = require("../models/interpreterModel");
const User = require("../models/userModel");
const createLog = require("../utils/loggerCtrl");
mongoose = require("mongoose")


// Api handles adding of new interpreter by the company admin
const createInterpreter = asyncHandler(async (req, res) => {
    try {

        const findUser = await User.findOne({email:req.body.email})
        if (!findUser) {
            const user = await User.create ({
                fullname: req.body.fullname,
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                rosterID:req.body.rosterID,
                expirationDate:req.body.expirationDate,
                password: req.body.password,
                role : 'interpreter',
                createdBy : req.user,
            });
            createLog(req.user._id, "Add an interpreter", "success", `${req.user.username} successfully added a new interpreter with ID ${user._id}`);
            res.status(201).json({messaeg:"Interpreter successfully added", role_details:user})
        } else {
            createLog(req.user._id, "Add an interpreter", "failed", `Error adding interpreter, ${req.body.email} already exist`);
            res.status(403).json({error:"Interpreter already exist"});
        }
        
    } catch (error) {
        createLog(req.user._id, "Add an interpreter", "failed", `Error adding interpreter`);
        res.status(400).json({message:"Error adding Interpreter", error:error.message});
    }
});


// get all interpreters of the company
const getAllInterpreters = asyncHandler(async (req, res) => {
    
    const {id} = req.user;
    
    try{
        const interpreters = await User.find({createdBy:id, role:"interpreter"})
        res.status(200).json({interpreters:interpreters})
    } catch (error) {
        res.status(500).json({error: "Error fetching interpreters"});
    }
});

module.exports = { createInterpreter, getAllInterpreters }