const asyncHandler = require("express-async-handler");
const Interpreter = require("../models/interpreterModel");
const User = require("../models/userModel");
mongoose = require("mongoose")


// Api handles adding of new interpreter by the company admin
const createInterpreter = asyncHandler(async (req, res) => {
    try {

        const findUser = await User.findOne({email:req.body.email})
        if (!findUser) {
            const user = await User.create ({
                ...req.body,
                role : 'interpreter',
                createdBy : req.user,
            });
            res.status(201).json({messaeg:"Interpreter successfully added", role_details:user})
        } else {
            res.status(403).json({error:"Interpreter already exist"});
        }
        
    } catch (error) {
        res.status(500).json(error);
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