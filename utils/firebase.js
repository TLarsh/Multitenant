const admin = require("firebase-admin");
const serviceAccount = require("../config/multitenant-e7890-firebase-adminsdk-fbsvc-56a41651e6.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (token, title, body) => {
    const message = {
        notification: { title, body },
        token,
    };

    try {
        await admin.messaging().send(message);
        console.log("Notification sent successfully");
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

module.exports = sendNotification;
