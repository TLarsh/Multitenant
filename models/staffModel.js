const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt')




var staffSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,  
    },
    email:{
        type:String,
    },
    phone:{
        type:Number,
        required:true,
        unique:true,
    },
    
    isActive:{
        type:Boolean,
        default:true,
    },
    
    address:{
        type:String,
    },
    appointment:{
        type:String,
    },
    completedAppointment:{
        type:Number,
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    
}, {
    timestamps:true
});






//Export the model
module.exports = mongoose.model('Staff', staffSchema);