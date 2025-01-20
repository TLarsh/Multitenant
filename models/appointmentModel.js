const mongoose = require('mongoose'); 


var appointmentSchema = new mongoose.Schema({
    interpreter:{
        type:String
    },
    client:{
        type:String
    },

    email:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    note:{
        type:String,
    },
    date:{
        type:String,
        required:true,
        
    },
    time:{
        type:String,
        required:true,
        
    },
    created_by:{
        type:String
    },
    
    address:{
        type:String
    },
    
    note:{
        type:String
    },
    feedback:{
        rating: {type:Number},
        feedback:{type:String},
        email:{type:String}
    }
    
    
},
{
    timestamps:true,
}
);

//Export the model
module.exports = mongoose.model('Appointment', appointmentSchema);