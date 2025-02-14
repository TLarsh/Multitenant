const mongoose = require('mongoose'); 


var logSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    },
    activity:{
        type:String,
    },
    
    status:{
        type:String,
        enum:['success', 'failed'],
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now,
    },
    
    description:{
        type:String
    },

});


module.exports = mongoose.model('Log', logSchema);