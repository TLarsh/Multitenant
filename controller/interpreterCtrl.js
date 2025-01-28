const asyncHandler = require("express-async-handler");
const Interpreter = require("../models/interpreterModel");
const User = require("../models/userModel");
mongoose = require("mongoose")


// Api handles adding of new interpreter by the company admin
const createInterpreter = asyncHandler(async (req, res) => {
    try {
        const newInterpreter = await Interpreter.create({...req.body, createdBy:req.user});
        const user = await User.create ({
            email : req.body.email,
            username : req.body.username,
            password : req.body.password,
            phone : req.body.phone,
            role : 'interpreter',
            createdBy : req.user,
        });
        console.log(user);
        // await interpreter.save();
        
        res.status(200).json({message:'interpreter successfully created', interpreter:newInterpreter, role_details:user});
    } catch (error) {
        res.status(500).json(error);
    }
});


// get all interpreters of the company
const getAllInterpreters = asyncHandler(async (req, res) => {
    
    const {id} = req.user;
    
    try{
        const interpreters = await Interpreter.find({createdBy:id})
        res.status(200).json({interpreters:interpreters})
    } catch (error) {
        res.status(500).json({error: "Error fetching interpreters"});
    }
});

module.exports = { createInterpreter, getAllInterpreters }