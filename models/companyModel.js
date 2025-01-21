const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt')




var companySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,  
    },
    email:{
        type:String,
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
}, {
    timestamps:true
});






//Export the model
module.exports = mongoose.model('Company', companySchema);