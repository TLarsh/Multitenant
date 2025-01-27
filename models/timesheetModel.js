const mongoose = require('mongoose'); 


var timesheetSchema = new mongoose.Schema({
    appointmentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true,
    },
    
    clockIn:{
        type:Date,
        required:true,
    },
    clockOut:{
        type:Date,
        required:true,
    },
    reason:{
        type:String,
    },
    
    date:{
        type:Date,
        required:true,
        
    },
    time:{
        type:String,
        
    },
    
    duration:{
        type:String
    },
    
    
},
{
    timestamps:true,
}
);

timesheetSchema.pre("save", function(next) {
    if (this.clockIn && this.clockOut) {
        const duration_in_minutes = Math.round((this.clockOut - this.clockIn)) / (1000 * 60);
        this.duration = duration_in_minutes;
    }
});

//Export the model
module.exports = mongoose.model('Timesheet', timesheetSchema);