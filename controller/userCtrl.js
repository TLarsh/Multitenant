const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const User = require("../models/userModel");
const validateMongoDbId = require("../utils/validateMongoDbId");
const jwt = require('jsonwebtoken');
const logModel = require("../models/logModel");

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

// HANDLE USERLOGIN
// const loginUserCtrl = asyncHandler(async (req, res) => {
//     const {email, password} = req.body;
//     console.log(email,password);
//     const findUser = await User.findOne({email:email});
//     // CHECK FOR THE EXISTENCE OF USER
//     try {
//         if  (findUser && await findUser.isPasswordMatched(password)) {
//             console.log(findUser)
//             const refreshToken = await generateRefreshToken(findUser?.id);
    
//             // UPDATE THE REFRESH TOKEN TO THE USER MODEL
//             const userRefreshToken = await User.findByIdAndUpdate(findUser.id,
//                 {
//                     refreshToken:refreshToken
//                 },{
//                     new:true
//                 });
//             res.cookie("refreshToken", refreshToken, {
//                 httpOnly:true,
//                 maxAge:72*60*60*1000,
//             }
//             )
    
//             const Loger = await logModel.create({
//                 name:findUser.username,
//                 activity:'signed in',
//                 status:'success',
//                 description:'User logged into the system'
//             })
    
//             res.json({
//                 _id: findUser?._id,
//                 username: findUser?.username,
//                 email: findUser?.email,
//                 phone: findUser?.phone,
//                 token: generateToken(findUser?._id),
//             });
            
//         }else{
//             console.log(error)
//             res.status(500).json(error);
//             // res.status(500).json({error:"Could not find user"});
//         }
//     } catch (error) {
//         throw new Error(error);
//     }
// });

const loginUserCtrl = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare passwords
        const isMatch = await user.isPasswordMatched(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT
        const refreshToken = generateToken(user._id);
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

        res.status(200).json({
            message: "Login successful",
            token:generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        // console.error(error);
        res.status(400).json({ message: "An error occurred", error: error.message });
    }
};


const getallUsers = asyncHandler ( async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        throw new Error(error);
    };
});

const totalUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.countDocuments();
        res.status(200).json({total:users})

    } catch(error) {
        // throw new Error(error)
        res.status(500).json({error:"Error finding total"})
    }
});

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


const updateaUser = asyncHandler (async (req, res) => {
    const {id} = req.user;
    
    try {
        const updatedUser = await User.findByIdAndUpdate(id,{
            username : req.body.username,
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

const updatePassword = asyncHandler (async (req, res) => {
    const { id } = req.user;
    const password = req.body;
    const user = await User.findById(id);
    if (password){
        user.password = password;
        const changedPassword = await user.save();
        res.status(200).json(changedPassword)
    } else {
        res.status(400).json({error:"field cannot be blank"})
    }
});

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



module.exports = { createUser, updatePassword, 
    loginUserCtrl, getaUser, getallUsers, 
    deleteaUser, updateaUser, activateUser, 
    deactivateUser, handleRefreshToken, 
    totalUsers, updateFcmToken, 
};