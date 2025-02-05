const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
const crypto = require('crypto');
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true  
    },
    fullname:{
        type:String,  
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        validate: {
            validator:function (v) {
                return /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(v)
            },
            message : "Invalid email format",
        }
    },
    phone:{
        type:String,
        required:true,
        unique:true,
        // validate: {
        //     validator:function (v) {
        //         return /^\d{1,11}$/.test(v)
        //     },
        //     message: "Phone number must contain only digits not more than 11 characters",
        // },
        maxlength: [11, "phone number cannot exceed 11 characters"]
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:["admin","company_admin","interpreter", "staff", "client",],
        default:"client",
    },
    isActive:{
        type:Boolean,
        default:true,
    },
    
    address:{
        type:String
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
    fcmToken: { 
        type: String 
    },
        
    refreshToken:{
        type:String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    timestamps:true
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


// userSchema.pre("findOneAndDelete", async function(next) {
//     const userId = this.getQuery().id;
//     try {
//         await mongoose.model("Appointment").deleteMany({ $or: [{ client: userId }, { interpreter: userId }] });
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

userSchema.methods.isPasswordMatched = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createPasswordResetToken = async function(){
    const resettoken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resettoken).digest("hex");
    this.passwordResetExpires = Date.now() + 30 * 80 * 1000;  // 10 minutes
    return resettoken;
};




//Export the model
module.exports = mongoose.model('User', userSchema);



