import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required: true,
            unique:true,
            lowercase:true
        },
        password:{
            type:String,
            required:[true,"password is required "]
        },
        role:{
            type:String,
            enum:["admin","analyst","viewer"],
            default:"viewer"
        },
        status:{
            type:String,
            enum:["active","inactive"],
            default:"active"
        },
        refreshTokens:{
            type:[String],
        }    
    },{timestamps:true}
)



userSchema.pre("save", async function ()  {
    if(!this.isModified("password")) return ;
     
    this.password =await bcrypt.hash(this.password,10)
    
}) 


userSchema.methods.isPasswordCorrect =async function (password) {
    return await bcrypt.compare(password,this.password)
}


userSchema.methods.generateAccessToken =function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            name:this.name, 
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN
        } 
    )
}
userSchema.methods.generateRefreshToken =function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFERESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRRESH_TOKEN_EXPIRES_IN
        } 
    )
}

export const User =mongoose.model("User",userSchema)