const express = require('express');
const { getUpcomingAppointments, getPastAppointments, markAsComplete, reshAppoint, } = require('../controller/appointmentCtrl');
const { authMiddleware, isInterpreter } = require('../middlewares/authMiddleware');
router = express.Router();

router.get('/upcoming-appointments', authMiddleware, isInterpreter, getUpcomingAppointments);
// router.post('/reschedule-appointment', authMiddleware, rescheduleAppointment);
router.get('/past-appointments', authMiddleware, isInterpreter, getPastAppointments);
router.put('/mark-complete/:id', authMiddleware, isInterpreter, markAsComplete);
router.put("/reschedule-appointment", authMiddleware, isInterpreter, reshAppoint);
// router.get('/:id/appointment-preview', authMiddleware, isInterpreter, appointmentPreview);

module.exports = router;