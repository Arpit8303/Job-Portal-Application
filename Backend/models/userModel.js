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

//middlewares
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