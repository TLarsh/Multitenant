const asyncHandler = require("express-async-handler");
const Client = require("../models/clientModel");
const User = require("../models/userModel");

// this api allows company admin to add client =========================================================
const addClient = asyncHandler(async (req, res) => {
  try {
    const findUser = await User.findOne({ email: req.body.email });
    if (!findUser) {
      const user = await User.create({
        fullame: req.body.fullname,
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        role: "client",
        createdBy: req.user,
      });
      createLog(req.user._id, "Add a client", "success", `${req.user.username} successfully added a new client with ID ${user._id}`);
      res
        .status(201)
        .json({ messaeg: "Client successfully added", role_details: user });
    } else {
      createLog(req.user._id, "Add a client", "failed", `Error adding client, ${req.body.email} already exist`);
      res.status(403).json({ error: "Client already exist" });
    }
  } catch (error) {
    createLog(req.user._id, "Add a client", "failed", `Error adding client.`);
    res.status(500).json(error);
  }
});

// get all clients to be seen by super admin ===========================================

const getAllClients = asyncHandler(async (req, res) => {
  const { id } = req.user;

  try {
    const clients = await User.find({ createdBy: id, role: "client" });
    // const clients = await Client.find({createdBy:id})
    res.status(200).json({ clients: clients });
  } catch (error) {
    res.status(400).json({ error: "Error fetching clients, make sure to provide Id" });
  }
});

//  count all clients by the company ==========================================

const getCompanyTotalClients = asyncHandler(async (req, res) => {
  const { id } = req.user;
  console.log(id);
  try {
    const countClient = await User.countDocuments({ id, role: "client" });
    res.status(200).json({ total: countClient });
  } catch (error) {
      console.log(error)
    res.status(400).json("Error retrieving company's total client, make sure and Id is provided");
  }
});


// add medical record to client details ==========================

const addMedicalRecord = asyncHandler(async (req, res) => {
  const {clientId} = req.params;
  console.log(clientId);
  try {
    const user = await User.findOne({_id:clientId});
    if (user.role !== 'client') return res.status(400).json({error:"User is not a client"});
    const client = await User.findByIdAndUpdate(
      clientId,
      {
        $push:{
          medicalRecords:{
            title:req.body.title,
            description:req.body.description,
          }
        }
      },
      {
        new:true,
      }
    );
    res.status(201).json({message:"Client medical record Successsfully added", client});
    console.log(client);
  } catch (error) {
    res.status(400).json({message:"There was an error adding medical record", error:error.message});
  }
});

module.exports = { addClient, getAllClients, getCompanyTotalClients, addMedicalRecord };
