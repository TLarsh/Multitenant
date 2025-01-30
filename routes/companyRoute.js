const express = require('express');
const router = express.Router();
const {  createInterpreter, getAllInterpreters } = require('../controller/interpreterCtrl');
const { authMiddleware, isCompanyAdmin } = require('../middlewares/authMiddleware');
const { getAllLogs, getAcompanyLogs } = require('../controller/logCtrl');
const { addStaff } = require('../controller/staffCtrl');
const { addClient, getAllClients, getCompanyTotalClients } = require('../controller/clientCtrl');
const { createAppointment, totalAppointments } = require('../controller/appointmentCtrl');
const { countStaffAndInterpreter } = require('../controller/staffInterpreterCtrl');
const { updateCompany } = require('../controller/companyCtrl');





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


module.exports = router