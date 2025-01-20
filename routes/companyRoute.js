const express = require('express');
router = express.Router();
const { createCompany, totalCompanies } = require('../controller/companyCtrl');
const { authMiddleware, isAdmin, } = require('../middlewares/authMiddleware');


router.post('', authMiddleware, isAdmin, createCompany)
router.get('/total', authMiddleware, isAdmin, totalCompanies)


module.exports = router