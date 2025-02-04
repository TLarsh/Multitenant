const express = require("express");
const router = express.Router();
const { sendMessage, getChatHistory } = require("../controller/messageCtrl");
const { authMiddleware } = require("../middlewares/authMiddleware");
authMiddleware

router.post("/send", authMiddleware, sendMessage);
router.get("/history/:userId", authMiddleware, getChatHistory);

module.exports = router;
