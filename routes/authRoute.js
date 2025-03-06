const express = require('express');
const router = express.Router();
const { uploadPhoto, profileImgResize} = require('../middlewares/uploadProfileImg');
const { 
    createUser, 
    loginUserCtrl, 
    getaUser, 
    getallUsers, 
    deleteaUser, 
    updateaUser, 
    deactivateUser, 
    activateUser, 
    handleRefreshToken, 
    totalUsers, 
    updatePassword, 
    updateFcmToken, 
    forgotPasswordToken, 
    resetPassword, 
    logout,
    updateProfileImages,
} = require('../controller/userCtrl');
const { authMiddleware, isAdmin, } = require('../middlewares/authMiddleware');


router.post('/login', loginUserCtrl);
router.post('/register', createUser);
router.get("/logout", logout);
router.get('/refresh', handleRefreshToken);
router.get('/get-users', authMiddleware, getallUsers);
router.get('/total', authMiddleware, isAdmin, totalUsers);
router.get('/:id', authMiddleware, isAdmin, getaUser);
router.delete('/:id', isAdmin, deleteaUser);
router.put("/profile-image", authMiddleware, uploadPhoto.single("image"), profileImgResize, updateProfileImages);
router.put('/:id', authMiddleware, updateaUser);
router.put('/deactivate/:id', authMiddleware, isAdmin, deactivateUser);
router.put('/activate/:id', authMiddleware, isAdmin, activateUser);
router.post('/change-password', authMiddleware, updatePassword);
router.post("/fcm-token", authMiddleware, updateFcmToken);
router.post("/password-reset-token", forgotPasswordToken);
router.put("/password-reset/:token", resetPassword);

module.exports = router;


