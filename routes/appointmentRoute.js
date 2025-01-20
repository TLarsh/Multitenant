const express = require('express');
router = express.Router();
const { createAppointment, totalAppointments } = require('../controller/appointmentCtrl');
const { authMiddleware, isAdmin, } = require('../middlewares/authMiddleware');


router.post('', authMiddleware, isAdmin, createAppointment)
router.get('/total', authMiddleware, isAdmin, totalAppointments)


module.exports = router