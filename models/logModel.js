const mongoose = require('mongoose'); 




var logSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,  
    },
    activity:{
        type:String,
    },
    
    status:{
        type:String,
    },
    // timestamp:{
    //     type:Date,
    //     default:Date.now,
    // },
    
    description:{
        type:String
    },
}, {
    timestamps:true
});






//Export the model
module.exports = mongoose.model('Log', logSchema);