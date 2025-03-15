const express = require('express');
const { getAppointments, getAppointment } = require('../controller/appointmentCtrl');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/appointments', authMiddleware, getAppointments);
router.get('/:id', authMiddleware, getAppointment);


module.exports = router;