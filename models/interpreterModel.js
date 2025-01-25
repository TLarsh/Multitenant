const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var interpreterSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    fullname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    phone:{
        type:String,
        unique:true,
    },
    languages:[{
        type: String,
        required: true,
    }],
    specializations:[{
        type: String,
        required: true,
    }],
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
module.exports = mongoose.model('Interpreter', interpreterSchema);