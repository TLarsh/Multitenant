const asyncHandler = require("express-async-handler");
const User = require('../models/userModel')

// Auto generate username on user registrarion =================================

const generateUniqueUsername = asyncHandler(async(fullname) => {
   try {
    let baseUsrname = fullname.split(" ")[0].toLowerCase();
    let username;
    let isUnique = false;

    while (!isUnique) {
        username = `${baseUsrname}${Math.floor(100 + Math.random() * 900)}`;
        const findUser = await User.findOne({ username });
        if (!findUser) isUnique = true;
    }
    return username;
   } catch (error) {
       throw new Error(error.message);
   }
});


// Auto generate password on user registration ===============================

const autoGenPassword = asyncHandler(async() => {
    try {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyx0123456789!@#$%^&*()";
        return Array.from({length: 6}, () => 
        chars[Math.floor(Math.random() * chars.length)]).join("");
    } catch (error) {
        throw new Error(error.message);
    }
});

module.exports = { generateUniqueUsername, autoGenPassword };