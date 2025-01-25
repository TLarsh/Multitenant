
const express = require('express');
const { myAppointments, rateAppointment, getUpcomingAppointments, getPastAppointments } = require('../controller/appointmentCtrl');
// const { getAllLogs, getAcompanyLogs } = require('../controller/logCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/view-appointments', authMiddleware, myAppointments);
router.get('/upcoming-appointments', authMiddleware, getUpcomingAppointments);
router.get('/past-appointments', authMiddleware, getPastAppointments);

router.put('/feedback', authMiddleware, rateAppointment);



module.exports = router;