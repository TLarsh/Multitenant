const express = require('express');
const router = express.Router();
const { createUser, loginUserCtrl, getaUser, getallUsers, deleteaUser, updateaUser, deactivateUser, activateUser, handleRefreshToken, totalUsers } = require('../controller/userCtrl');
const { authMiddleware, isAdmin, } = require('../middlewares/authMiddleware');


router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.get('/refresh', handleRefreshToken);
router.get('/get-users', authMiddleware, getallUsers);
router.get('/total', authMiddleware, isAdmin, totalUsers);
router.get('/:id', authMiddleware, isAdmin, getaUser);
router.delete('/:id', isAdmin, deleteaUser);
router.put('/edit', authMiddleware, updateaUser);
router.put('/deactivate/:id', authMiddleware, isAdmin, deactivateUser);
router.put('/activate/:id', authMiddleware, isAdmin, activateUser);

module.exports = router;


