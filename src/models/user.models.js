import { Schema, model } from "mongoose"

import { Video } from "./video.models.js"

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

import jwt from "jsonwebtoken"

import bycrpt from "bcrypt"

const userSchema = Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar:
    {
        type: String, // cloudinary url
        required: true
    },
    coverImage: {
        type: String, //cloudinary url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String, // bycrpt for hashing 
        required: [true, "Password is Required"]
    },
    refreshToken : {
        type : String,
        required : true
    }
},
    { timestamps: true })


userSchema.pre("save", async function (next){
    if(!this.isModified("password")){
        return next()
    }

    this.password = await bycrpt.hash(this.password, 10)
    next()


})


userSchema.methods.isPasswordCorrect = async function (password){
    return await bycrpt.compare(password , this.password)
}

userSchema.methods.generateAccessTokens = function (){
   return   accessToken = jwt.sign(
        {
            _Id : this._id,
            email : this.email,
            username : this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
        }
    )
}


userSchema.methods.generateRefreshToken = function (){
    return  refreshToken = jwt.sign(
        {
            Id : this._id,
            email : this.email,
            username : this.username,
            fullName : this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
        }
    ) 
}
export const User = model("User", userSchema)