const logModel = require("../models/logModel");

const getAllLogs = asyncHandler ( async (req, res) => {
    try {
        const logs = await logModel.find();
        res.json(logs);
    } catch (error) {
        throw new Error(error);
    };
});



module.exports = { getAllLogs, }