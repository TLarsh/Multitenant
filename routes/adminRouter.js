const express = require('express');
router = express.Router();
const { authMiddleware, isAdmin, } = require('../middlewares/authMiddleware');
const { createCompany, totalCompanies, getAllCompanies, getACompany, updateCompany } = require('../controller/companyCtrl');
const { getAcompanyLogs } = require('../controller/logCtrl');
const { overallStaffAndInterpreter } = require('../controller/staffInterpreterCtrl');



router.get('/get-company-total', authMiddleware, isAdmin, totalCompanies);
router.get('/get-companies', authMiddleware, isAdmin, getAllCompanies);
router.get('/get-company/:id', authMiddleware, isAdmin, getACompany);
router.get('/company-edit/:id', authMiddleware, isAdmin, updateCompany);
router.post('/add-company', authMiddleware, isAdmin, createCompany);
router.get('/logs', authMiddleware, isAdmin, getAcompanyLogs);
router.get('/total-staffs-interpreters', authMiddleware, isAdmin, overallStaffAndInterpreter);




module.exports = router
