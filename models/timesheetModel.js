const mongoose = require('mongoose'); 


var timesheetSchema = new mongoose.Schema({
    interpreter: { type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    staff: { type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
    },
    client: { type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
    },
    appointmentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true,
    },
    visitationId: { 
        type: String, 
        // required: true 
    },
    
    clockIn:{
        type:Date,
        default: null,
    },
    clockOut:{
        type:Date,
        default: null,
    },
    reason:{
        type:String,
    },
    
    date:{
        type:Date,
        required:true,
        
    },
    status: {
        type: String,
        enum: ['submited', 'approved', 'rejected'],
        default: 'submited'
    },
    
    duration:{
        type:Number,
        default: 0
    },
    
    
},
{
    timestamps:true,
}
);

// timesheetSchema.pre("save", function(next) {
//     if (this.clockIn && this.clockOut) {
//         const duration_in_minutes = Math.round((this.clockOut - this.clockIn)) / (1000 * 60);
//         this.duration = duration_in_minutes/(1000 * 60 * 60);
//     } else {
//     this.duration = 0;
// }
// });

//Export the model
module.exports = mongoose.model('Timesheet', timesheetSchema);