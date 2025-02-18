const mongoose = require('mongoose'); 


var appointmentSchema = new mongoose.Schema({
    interpreter:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    staff:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    
    staffType:{
        type:String,
        enum:['HDM','Nurse','Doctor', 'Health Care', 'Others'],
        required:true
    },
    insuranceCompany:{
        type:String,
        required:true,
    },
    language:{
        type:String,
        required:true,
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
    status:{
        type:String,
        enum:['scheduled','completed','canceled', 'rescheduled'],
        default:'scheduled'
    },
    appointmentType:{
        type:String,
        enum:['In Person','Remote', 'Phone'],
        required:true,
    },
    date:{
        type:Date,
        required:true,
        
    },
    time:{
        type:String,
        required:true,
        
    },
    agreementForm:{
        type:String,   
    },

    signedAgreementForm:{
        type:String,     
    },

    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    
    address:{
        type:String
    },
    
    feedback:{
        rating: {type:Number},
        comment:{type:String},
        email:{type:String},
        ratedBy:{type:mongoose.Schema.Types.ObjectId, ref:"User"}
    },
    
    
},
{
    timestamps:true,
}
);

//Export the model
module.exports = mongoose.model('Appointment', appointmentSchema);