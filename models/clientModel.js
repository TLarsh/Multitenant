const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model for client
var clientSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },    
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    phone:{
        type:String,
        required:true,
        unique:true,
    },
    address:{
        type:String,
    },
    appointments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment"
        }
    ],
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
   
});

//Export the model
module.exports = mongoose.model('Client', clientSchema);