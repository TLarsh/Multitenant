const express = require('express');
router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getDailySummary, getBiWeeklySummary, getMonthlySummary, getStatusSummary, } = require('../controller/appointmentCtrl');

router.get('/daily', authMiddleware, getDailySummary);
router.get('/bi-weekly', authMiddleware, getBiWeeklySummary);
router.get('/monthly', authMiddleware, getMonthlySummary);
router.get('/status-summary', authMiddleware, getStatusSummary);

module.exports = router;