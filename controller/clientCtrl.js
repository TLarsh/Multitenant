const asyncHandler = require("express-async-handler");
const Client = require("../models/clientModel");
const User = require("../models/userModel");

// this api allows company admin to add client
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
      res
        .status(201)
        .json({ messaeg: "Client successfully added", role_details: user });
    } else {
      res.status(403).json({ error: "Client already exist" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// get all clients to be seen by super admin
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

//  count all clients by the company
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

module.exports = { addClient, getAllClients, getCompanyTotalClients };
