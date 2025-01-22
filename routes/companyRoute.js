const express = require('express');
const router = express.Router();
const { createCompany, totalCompanies, getAllCompanies } = require('../controller/companyCtrl');
const { authMiddleware, isAdmin, } = require('../middlewares/authMiddleware');
const { getAllLogs, getAcompanyLogs } = require('../controller/logCtrl');



router.post('/add', authMiddleware, isAdmin, createCompany);
router.get('/total', authMiddleware, isAdmin, totalCompanies);
router.get('/get-companies', authMiddleware, isAdmin, getAllCompanies);
router.get('/logs', authMiddleware, isAdmin, getAcompanyLogs);


module.exports = router