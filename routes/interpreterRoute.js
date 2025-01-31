const express = require('express');
const { 
    getUpcomingAppointments, 
    getPastAppointments, 
    markAsComplete, 
    reshAppoint, 
    getClientAppointments, 
    getInterpreterAppointments,
    uploadAgreementForm,
} = require('../controller/appointmentCtrl');
const { createTimesheet } = require('../controller/timesheetCtrl');
const { authMiddleware, isInterpreter } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadFiles');
router = express.Router();

router.get('/upcoming-appointments', authMiddleware, isInterpreter, getUpcomingAppointments);
router.get('/view-appointments', authMiddleware, isInterpreter, getClientAppointments);

// router.post('/reschedule-appointment', authMiddleware, rescheduleAppointment);
router.get('/past-appointments', authMiddleware, isInterpreter, getPastAppointments);
router.put('/mark-complete/:appointmentId', authMiddleware, isInterpreter, markAsComplete);
router.put("/reschedule-appointment/:appointmentId", authMiddleware, isInterpreter, reshAppoint);
router.get('/view-appointments', authMiddleware, getInterpreterAppointments);
router.put('/signed-agreement-form/:appointmentId', authMiddleware, isInterpreter, upload.single("file"), uploadAgreementForm);
router.post('/check-in', authMiddleware, isInterpreter, createTimesheet);


// router.get('/:id/appointment-preview', authMiddleware, isInterpreter, appointmentPreview);

module.exports = router;