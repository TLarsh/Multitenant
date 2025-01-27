const logModel = require("../models/logModel");
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require("../utils/validateMongoDbId");

const getAllLogs = asyncHandler ( async (req, res) => {
    try {
        const logs = await logModel.find();
        res.json(logs);
    } catch (error) {
      res.status(500).json({error: "Error fetching logs"});;
    };
});



// Get logs for a single company with optional date filtering
const getAcompanyLogs = asyncHandler( async (req, res) => {
    console.log(req.user);
    const { name, timeframe } = req.query

  
    if (!name) {
      return res.status(400).json({ error: "Could not get company name" });
    }
  
    let dateFilter = {};
  
    // Filter by timeframe
    if (timeframe) {
      const now = new Date();
      switch (timeframe) {
        case "12months":
          dateFilter = { timestamp: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
          break;
        case "30days":
          dateFilter = { timestamp: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
          break;
        case "7days":
          dateFilter = { timestamp: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
          break;
        case "24hours":
          dateFilter = { timestamp: { $gte: new Date(now.setDate(now.getDate() - 1)) } };
          break;
        case "alltime":
        default:
          dateFilter = {}; // No filter for all time
          break;
      }
    }
    
    const query = name
    console.log({"query":query})
    try {
    //   const logs = await logModel.find({query})

      const logs = await logModel.find({ name, ...dateFilter }).sort({ timestamp: -1 });
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs", details: error });
    }
  });
  



module.exports = { getAllLogs, getAcompanyLogs };