const Message = require("../models/messageModel");
const User = require("../models/userModel");

// Client sends a message to the company admin
const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user._id;

        // Ensure receiver exists
        const receiver = await User.findById(receiverId);
        // if (!receiver || receiver.role !== "company_admin") {
        if (!receiver ) {
            return res.status(404).json({ message: "Receiver not found" });
        }

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            message,
        });

        await newMessage.save();
        res.status(201).json({ 
            message: "Message sent successfully", 
            data: newMessage 
        });
    } catch (error) {
        res.status(500).json({ message: "Error sending message", error: error.message });
    }
};

// Get chat history between client and company admin
const getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params; // The other participant's ID (either client or admin)
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        }).sort({ timestamp: 1 });

        res.json({ messages });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving chat history", error: error.message });
    }
};

module.exports = { sendMessage, getChatHistory };
