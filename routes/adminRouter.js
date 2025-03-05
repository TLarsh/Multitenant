const express = require('express');
router = express.Router();
const { authMiddleware, isAdmin, } = require('../middlewares/authMiddleware');
const { createCompany, totalCompanies, getAllCompanies, getACompany, updateCompany, activateCompany, deactivateCompany, } = require('../controller/companyCtrl');
const { getAcompanyLogs } = require('../controller/logCtrl');
const { overallStaffAndInterpreter } = require('../controller/staffInterpreterCtrl');
const { deleteAppointment } = require('../controller/appointmentCtrl');
const { deleteTimesheet } = require('../controller/timesheetCtrl');




router.get('/get-company-total', authMiddleware, isAdmin, totalCompanies);
router.get('/get-companies', authMiddleware, isAdmin, getAllCompanies);
router.get('/get-company/:id', authMiddleware, isAdmin, getACompany);
router.get('/company-edit/:id', authMiddleware, isAdmin, updateCompany);
router.post('/add-company', authMiddleware, isAdmin, createCompany);
router.get('/logs', authMiddleware, isAdmin, getAcompanyLogs);
router.put('/activate-company/:id', authMiddleware, isAdmin, activateCompany);
router.put('/deactivate-company/:id', authMiddleware, isAdmin, deactivateCompany);
router.get('/total-staffs-interpreters', authMiddleware, isAdmin, overallStaffAndInterpreter);
router.delete('/delete-appointment/:id', authMiddleware, isAdmin, deleteAppointment);
router.delete('/delete-timesheet/:id', authMiddleware, isAdmin, deleteTimesheet);




module.exports = router
