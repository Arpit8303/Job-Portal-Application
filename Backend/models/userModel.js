import mongoose,{ Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

const userSchema = new Schema({
name:{
    type:String,
    required:[true,"Name is required"]
},
lastName:{
    type:String,
    default:""
},
email:{
    type:String,
    required:[true,"Email is required"],
    unique:true,
    validate: validator.isEmail
},
password:{
    type:String,
    required:[true,"Password is required"],
    minlength:[6,"Password must be at least 6 characters"],
   select:false,
},
location:{
    type:String,
    default:"India"
},
role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
},
isPublic: {
    type: Boolean,
    default: false
},
username: {
    type: String,
    default: null,
    maxlength: 40,
    // NOTE: uniqueness is checked manually in updatePublicSettings controller
    // to avoid MongoDB index issues with multiple null/empty values
},
googleId: {
    type: String,
    default: null,
    sparse: true,
},
twoFactorEnabled: {
    type: Boolean,
    default: false
},
twoFactorSecret: {
    type: String,
    select: false,
    default: null
},
skills: {
    type: [String],
    default: []
},
resumeUrl: {
    type: String,
    default: ""
},
monthlyGoal: {
    type: Number,
    default: 20
}
},
{timestamps:true})

// Pre-save: convert empty string username to null
userSchema.pre("save", function(next) {
    if (this.username === "") this.username = null;
    next();
});

//middlewares — hash password
userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

//compare password
userSchema.methods.comparePassword = async function(userPassword){
    const isMatch = await bcrypt.compare(userPassword, this.password);
    return isMatch;
}

//JSON webtoken
userSchema.methods.createJWT = function () {
    return JWT.sign({ userId: this._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
    }

const userModel = mongoose.model("User", userSchema);

export default userModel;