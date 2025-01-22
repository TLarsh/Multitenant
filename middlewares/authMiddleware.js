// const User = require("../models/userModel");
// const jwt = require("jsonwebtoken");
// const asyncHandler = require("express-async-handler");
// detenv = require('dotenv');


// const authMiddleware = asyncHandler(async (req, res, next) => {
//     let token;
//     if(req?.headers?.authorization?.startsWith("Bearer")) {
//         token = req.headers.authorization.split(" ")[1];
//         try{
//             if(token){
//                 const decoded = jwt.verify(token, process.env.JWT_SECRET);
//                 const user = await User.findById(decoded.id);
//                 req.user = user;
//                 // req.user = {
//                 //     id: decoded.id,
//                 //     name: decoded.name,
//                 //     email: decoded.email,
//                 //   };
              
//                 next();
//             }
//         }catch(error){
//             throw new Error("Not authorized token expired, Please Lodin again");
//         }
//     }else{
//         throw new Error("There is no token attached to header");
//     }
// });

// const isAdmin = asyncHandler(async (req, res, next) => {
//     console.log(req.user);
//     if (req.user && req.user.role==='admin') {
//         return next(); // User is an admin, proceed to the next middleware or route handler
//       }
    
//       // If not an admin, return an error
//       return res.status(403).json({ error: "Access denied: Admins only" });
// })

// module.exports = { authMiddleware, isAdmin }

const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


const authMiddleware = asyncHandler(async(req, res, next)=>{
    let token;
    if (req.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        try{
            if(token){
                const decoded = jwt.verify(token, process.env.JWT_SECRET); //verifying token
                console.log(decoded)
                const user = await User.findById(decoded.id);
                console.log(user)
                req.user = user; //Attach the decoded token payload to the request object
                next();  //call the middleware / controller
            }
        }catch(error){ 
            throw new Error("Not authorized token expired, Please login again")
        }
    }else{
        throw new Error('There is no token attached to header')
    }
});

const isAdmin = asyncHandler(async(req, res, next) =>{
    console.log(req.user)
    const {email} = req.user;
    const adminUser = await User.findOne({email});
    if(adminUser.role !== "admin"){
        throw new Error("Access denied: Admins only")
    } else {
        next();
    }

});

module.exports = {authMiddleware, isAdmin}

