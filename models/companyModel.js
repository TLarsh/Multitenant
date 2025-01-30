const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt')




var companySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,  
    },
    email:{
        type:String,
        unique:true,
        lowercase:true,
        validate: {
            validator:function (v) {
                return /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(v)
            },
            message : "Invalid email format",
        }
    },
    phone:{
        type:Number,
        required:true,
        maxlength: [11, "phone number cannot exceed 11 characters"],
        unique:true,
    },
    
    isActive:{
        type:Boolean,
        default:true,
    },
    
    address:{
        type:String
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    
}, {
    timestamps:true
});






//Export the model
module.exports = mongoose.model('Company', companySchema);