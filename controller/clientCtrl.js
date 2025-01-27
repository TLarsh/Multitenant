const asyncHandler = require("express-async-handler");
const Client = require("../models/clientModel");
const User = require("../models/userModel");

// this api allows company admin to add client
const addClient = asyncHandler(async (req, res) => {
    try {
        const client = await Client.create({...req.body, createdBy:req.user})
        const user = await User.create({
            ...req.body,
            role : 'client',
            createdBy:  req.user
        });
        res.status(200).json({message:"Client successfully created", client:client, role_detail:user})
    } catch (error) {
        res.status(500).json({error: "Error adding client"});
    }
});

// get all clients to be seen by super admin
const getAllClients = asyncHandler(async (req, res) => {
    const {id} = req.user;
    
    try{
        const clients = await Client.find({createdBy:id})
        res.status(200).json({clients:clients})
    } catch (error) {
        res.status(500).json({error: "Error fetching clients"});
    }
});

//  count all clients by the company
const getCompanyTotalClients = asyncHandler(async (req, res) => {
    const { id } = req.user;
    console.log(id)
    try {
        const countClient = await User.countDocuments({id, 
        role:"client"});
        res.status(200).json({total: countClient});
    } catch (error) {
        res.status(500).json("Error retrieving company's total client")
    }
})





module.exports = { addClient, getAllClients, getCompanyTotalClients}
