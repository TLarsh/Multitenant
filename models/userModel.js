const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt')
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    username:{
        type:String,  
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
        
    refreshToken:{
        type:String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    timestamps:true
});

userSchema.pre("save", async function(next){
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt)
});

userSchema.pre("findOneAndDelete", async function(next) {
    const userId = this.getQuery().id;
    try {
        await mongoose.model("Appointment").deleteMany({ $or: [{ client: userId }, { interpreter: userId }] });
        next();
    } catch (error) {
        next(error);
    }
});

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



