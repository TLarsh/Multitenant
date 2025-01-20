const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin, } = require('../middlewares/authMiddleware');


router.get('', authMiddleware, isAdmin, getLogs)