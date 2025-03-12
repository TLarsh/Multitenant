const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const User = require("../models/userModel");
const validateMongoDbId = require("../utils/validateMongoDbId");
const jwt = require('jsonwebtoken');
const logModel = require("../models/logModel");
const sendEmail = require("./emailCtrl");
const crypto = require('crypto');
const createLog = require("../utils/loggerCtrl");
const {cloudinary} = require("../utils/cloudinary");
const fs = require("fs");

// Create User ==================================================
const createUser = asyncHandler( async(req, res) => {
    const email = req.body.email
    console.log(email)
    const findUser = await User.findOne({email:email})
    console.log(findUser)
    if (!findUser){
        const collectedUser = req.body
        console.log(collectedUser)
        const newUser = await User.create(req.body);
        res.json(newUser);
    }else{
        res.status(403).json({error:'User already exist'});
    };
});

// HANDLE USERLOGIN =====================================================

const loginUserCtrl = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        
        if (!user) {
            createLog(null, "Login attempt", "failed", `failed login attempt for ${email}`);
            return res.status(401).json({ message: "Invalid email or password" });
        }
        
        // Compare passwords
        const isMatch = await user.isPasswordMatched(password);
        if (!isMatch) {
            createLog(null, "Login attempt", "failed", `failed login attempt for ${email}`);
            return res.status(401).json({ message: "Invalid email or password" });
        }
    
        
        // Generate JWT
        const refreshToken = generateRefreshToken(user._id);
        const userRefreshToken = await User.findByIdAndUpdate(user._id,
            {
                refreshToken:refreshToken
            },{
                new:true
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly:true,
                maxAge:72*60*60*1000,
            }
            )
            
            createLog(user._id, "Login attempt", "success", `${user.username} logged into the system`);
            res.status(200).json({
                message: "Login successful",
                token:generateToken(user._id),
                user: {
                    id: user._id,
                    username: user.username,
                    fullname: user.fullname,
                    email: user.email,
                    profileImage: user.profileImage,
                    role: user.role,
                },
            });
        } catch (error) {
        createLog(null, "Login attempt", "failed", `Error during login for ${email}`);
        // console.error(error);
        res.status(400).json({ message: "An error occurred", error: error.message });
    }
};

// Retrieves all users =================================================

const getallUsers = asyncHandler ( async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        throw new Error(error);
    };
});

// Active, inactive, and overall user count ==========================

const totalUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.countDocuments();
        const activeUsers = await User.countDocuments({isActive:true});
        const inactiveUsers = await User.countDocuments({isActive:false});
        res.status(200).json({
            active:activeUsers,
            inactive:inactiveUsers,
            total:users
        });

    } catch(error) {
        // throw new Error(error)
        res.status(500).json({error:"Error finding total"})
    }
});

// Retrive a user by its ID ========================================

const getaUser = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const user = await User.findById(id);
        res.json(user);
    } catch (error) {
        // throw new Error(error);
        res.status(400).json("User not found")
    };
});

// Find a user by its ID and delete =================================

const deleteaUser = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        res.json(deletedUser);
    } catch (error) {
        // throw new Error(error);
        res.status(400).json({error:"Can't find user "})
    };
});

// Find a user by ID and update ===================================

const updateaUser = asyncHandler (async (req, res) => {
    const {id} = req.user;
    
    try {
        const updatedUser = await User.findByIdAndUpdate(id,{
            username : req.body.username,
            fullname : req.body.fullname,
            email : req.body.email,
            phone : req.body.phone,
        }, {
            new : true
        });
        res.json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }
});

// Update User password ==============================================

const updatePassword = asyncHandler (async (req, res) => {
    const { id } = req.user;
    const { password } = req.body;
    console.log({password:password})
    const user = await User.findById(id);
    if (password){
        user.password = password;
        const changedPassword = await user.save();
        res.status(200).json(changedPassword)
    } else {
        res.status(400).json({error:"field cannot be blank"})
    }
});

// Find a user by its ID and activate  ====================================

const activateUser = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const activatedUser = await User.findByIdAndUpdate(id, {
            isActive : true
        },{
            new:true
        });
        res.json (activatedUser);
    } catch (error) {
        throw new Error(error);
    }
});

// Find user by ID and deactivate =====================================

const deactivateUser = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const deactivated = await User.findByIdAndUpdate(id, {
            isActive : false,
        },{
            new:true,
        });
        res.json(deactivated);
    } catch (error) {
        throw new Error(error);
    }
});


// Genetate a forget password token and send a reset link to the user email ==============

const forgotPasswordToken = asyncHandler(async(req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this email");
    const token = await user.createPasswordResetToken()
    await user.save();
    const resetURL = `Hi, Please follow the reset link to reset your password. Valid for 10min from now. < href='http://localhost:8000/api/user/password-reset/${token}'>Click Here</>`;
       const data = {
           to: email,
           text: "Hey User",
           subbject: "Forgot Password Link",
           html: resetURL,
       };
       sendEmail(data);
       res.json(data);
    try {
    } catch(error) {
       throw new Error(error);
    }
});

// Reset user password ==========================================

const resetPassword = asyncHandler(async(req, res) => {
    const { password } = req.body;
    const { token} = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error("Token Expired, Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.json(user);
});


// Get refresh token for user =========================================

const handleRefreshToken = asyncHandler (async(req, res) => {
    const cookie = req.cookies;
    console.log(cookie);
    if (!cookie.refreshToken) throw new Error("No refresh token in cookies");
    const refreshToken = cookie.refreshToken;
    console.log(refreshToken);
    const user = await User.findOne({refreshToken});
    if (!user) throw new Error("No refresh token present")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if(err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token");
        }
        const accessToken = generateToken(user.id);
        res.json({accessToken});
    });
});


// save FirebaseCloudMessaging token =========================

const updateFcmToken = async (req, res) => {
    try {
        const { token } = req.body;
        await User.findByIdAndUpdate(req.user.id, { fcmToken: token });
        res.status(201).json({ message: "FCM token saved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error saving token", error: error.message });
    }
};



// LOGOUT FUNCTIONALITY =================================================

const logout = asyncHandler(async(req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error("No refresh cookie present in cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    console.log(user);
    if(!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });
        // NO CONTENT
        return res.sendStatus(204);
    }
    // await User.findOneAndUpdate(refreshToken, {
    //     refreshToken: "",
    // });
    user.refreshToken = "";
    await user.save()
    res.clearCookie("refreshToken", {
        httpOnly: true, 
        secure: true,
    });
    
    res.status(200).json({message:"Successfully logged out"});
});


// Update Profile Image ============================================

const updateProfileImages = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id; // Assuming you use JWT middleware
        const user = await User.findById(userId);
        

        if (!user) return res.status(404).json({ message: "User not found" });

        if (!req.file) return res.status(400).json({ message: "No image uploaded" });

        // Upload to Cloudinary
        const imageUrl = await cloudinary.uploader.upload(req.file.path);

        fs.unlinkSync(req.file.path);
        // Update user profile image
        user.profileImage = imageUrl.secure_url;
        await user.save();

        res.status(200).json({ message: "Profile image updated", user: user });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile image", error: error.message });
    }
});




// const updateProfileImages = asyncHandler(async(req, res) => {
//     const { id } = req.user._id;
//     validateMongoDbId(id);
//     console.log(req.files)
//     try {
//         const uploader = (path) => cloudinaryUploadImg(path, "image");
//         const urls = [];
//         const files = req.files; 
//         for (const file of files) {
//             const {path} = file;
//             const newpath = await uploader(path);
//             console.log(newpath);
//             urls.set(newpath);
//             console.log(file);
//             fs.unlinkSync(path);
//         }

//         const findUser = await User.findByIdAndUpdate(
//             id,
//             {
//                 profileImage : urls.map((file) => {
//                 return file;
//             }),
//             },
//             {
//                 new : true,
//             }
//             );
//             res.json(findUser)
//     } catch (error) {
//         throw new Error(error)
//     }
// });



module.exports = { createUser, updatePassword, 
    loginUserCtrl, getaUser, getallUsers, 
    deleteaUser, updateaUser, activateUser, 
    deactivateUser, handleRefreshToken, 
    totalUsers, updateFcmToken, forgotPasswordToken,
    resetPassword, logout, updateProfileImages,
};
