
const express = require('express');
const { myAppointments, rateAppointment, getUpcomingAppointments, getPastAppointments, getClientAppointments, reshAppoint, uploadAgreementForm } = require('../controller/appointmentCtrl');
// const { getAllLogs, getAcompanyLogs } = require('../controller/logCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadFiles');
const router = express.Router();

// router.get('/view-appointments', authMiddleware, myAppointments);
router.get('/view-appointments', authMiddleware, getClientAppointments);
router.get('/upcoming-appointments', authMiddleware, getUpcomingAppointments);
router.get('/past-appointments', authMiddleware, getPastAppointments);
router.put('/reschedule-appointment/:appointmentId', authMiddleware, reshAppoint);
router.put('/agreement-form/:appointmentId', authMiddleware, upload.single("agreementForm"), uploadAgreementForm);
router.put('/feedback', authMiddleware, rateAppointment);



module.exports = router;