const asyncHandler = require("express-async-handler");
const Interpreter = require("../models/interpreterModel");
const User = require("../models/userModel");
mongoose = require("mongoose")


// Api handles adding of new interpreter by the company admin
const createInterpreter = asyncHandler(async (req, res) => {
    try {
        const newInterpreter = await Interpreter.create({...req.body, createdBy:req.user});
        const interpreter = await User.create({
            ...req.body,
            role : 'interpreter',
            company : req.user
        });
        
        res.status(200).json({message:'interpreter successfully created', interpreter:newInterpreter, role_details:interpreter});
    } catch (error) {
        throw new Error(error);
    }
});


// get all interpreters of the company
const getAllInterpreters = asyncHandler(async (req, res) => {
    
    const {id} = req.user;
    
    try{
        const interpreters = await Interpreter.find({createdBy:id})
        res.status(200).json({interpreters:interpreters})
    } catch (error) {
        throw new Error(error)
    }
});

module.exports = { createInterpreter, getAllInterpreters }