const express = require('express');
router = express.Router();
const { authMiddleware, isAdmin, } = require('../middlewares/authMiddleware');
const { createCompany, totalCompanies, getAllCompanies } = require('../controller/companyCtrl');
const { getAcompanyLogs } = require('../controller/logCtrl');
const { overallStaffAndInterpreter } = require('../controller/staffInterpreterCtrl');



router.get('/get-company-total', authMiddleware, isAdmin, totalCompanies);
router.get('/get-companies', authMiddleware, isAdmin, getAllCompanies);
router.post('/add-company', authMiddleware, isAdmin, createCompany);
router.get('/logs', authMiddleware, isAdmin, getAcompanyLogs);
router.get('/total-staffs', authMiddleware, isAdmin, overallStaffAndInterpreter);




module.exports = router
