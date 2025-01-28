const express = require('express');
const { getUpcomingAppointments, getPastAppointments, markAsComplete, reshAppoint, getClientAppointments, getInterpreterAppointments, } = require('../controller/appointmentCtrl');
const { authMiddleware, isInterpreter } = require('../middlewares/authMiddleware');
router = express.Router();

router.get('/upcoming-appointments', authMiddleware, isInterpreter, getUpcomingAppointments);
router.get('/view-appointments', authMiddleware, isInterpreter, getClientAppointments);

// router.post('/reschedule-appointment', authMiddleware, rescheduleAppointment);
router.get('/past-appointments', authMiddleware, isInterpreter, getPastAppointments);
router.put('/mark-complete/:appointmentId', authMiddleware, isInterpreter, markAsComplete);
router.put("/reschedule-appointment", authMiddleware, isInterpreter, reshAppoint);
router.get('/view-appointments', authMiddleware, getInterpreterAppointments);

// router.get('/:id/appointment-preview', authMiddleware, isInterpreter, appointmentPreview);

module.exports = router;