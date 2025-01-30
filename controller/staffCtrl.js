const asyncHandler = require("express-async-handler");
const Staff = require("../models/staffModel");
const User = require("../models/userModel");

const addStaff = asyncHandler(async (req, res) => {
    try {

        const findUser = await User.findOne({email:req.body.email})
        if (!findUser) {
            const user = await User.create ({
                ...req.body,
                role : 'staff',
                createdBy : req.user,
            });
            res.status(201).json({messaeg:"Staff successfully added", role_details:user})
        } else {
            res.status(403).json({error:"Staff already exist"});
        }
        
    } catch (error) {
        res.status(500).json(error);
    }
});


module.exports = { addStaff, }
