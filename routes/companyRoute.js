const express = require('express');
const router = express.Router();
const {  createInterpreter, getAllInterpreters } = require('../controller/interpreterCtrl');
const { authMiddleware, isCompanyAdmin } = require('../middlewares/authMiddleware');
const { getAllLogs, getAcompanyLogs } = require('../controller/logCtrl');
const { addStaff } = require('../controller/staffCtrl');
const { addClient, getAllClients, getCompanyTotalClients, addMedicalRecord } = require('../controller/clientCtrl');
const { createAppointment, totalAppointments, cancelAppointment, countCompletedAppointment, } = require('../controller/appointmentCtrl');
const { countStaffAndInterpreter } = require('../controller/staffInterpreterCtrl');
const { updateCompany } = require('../controller/companyCtrl');
const { getTimesheets, sendClockInReminder} = require('../controller/timesheetCtrl');





router.post('/add-interpreter', authMiddleware, isCompanyAdmin, createInterpreter);
router.get('/get-interpreters', authMiddleware, isCompanyAdmin, getAllInterpreters);
router.post('/add-staff', authMiddleware, isCompanyAdmin, addStaff);
router.post('/add-client', authMiddleware, isCompanyAdmin, addClient);
router.get('/get-clients', authMiddleware, isCompanyAdmin, getAllClients);
router.get('/get-total-clients', authMiddleware, isCompanyAdmin, getCompanyTotalClients);
router.post('/add-appointment', authMiddleware, isCompanyAdmin, createAppointment);
router.get('/get-total-appointments', authMiddleware, isCompanyAdmin, totalAppointments);
router.get('/get-total-staffs-interpreters', authMiddleware, isCompanyAdmin, countStaffAndInterpreter);
router.put('/edit/:id', authMiddleware, isCompanyAdmin, updateCompany);
router.put('/client-medical-record/:clientId', authMiddleware, isCompanyAdmin, addMedicalRecord);
router.put('/cancel-appointment/:appointmentId', authMiddleware, isCompanyAdmin, cancelAppointment);
router.get('/timesheets', authMiddleware, isCompanyAdmin, getTimesheets);
router.get('/completed-appointment/:interpreterId', authMiddleware, isCompanyAdmin, countCompletedAppointment);
router.post('/send-notification/:interpreterId', authMiddleware, sendClockInReminder);


module.exports = router;