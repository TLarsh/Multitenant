

const express = require('express');
const { getAllLogs, getAcompanyLogs } = require('../controller/logCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('', authMiddleware, isAdmin, getAllLogs);



module.exports = router;