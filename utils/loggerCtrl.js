const Log = require('../models/logModel');

const createLog = async(userId, activity, status, description) => {
    try {
        const logData = {
            user: userId || null,
            activity,
            status,
            description
        }
        await Log.create(logData);
    } catch (error) {
        console.error("Error logging activity", error.message);
    }
};

module.exports = createLog;


