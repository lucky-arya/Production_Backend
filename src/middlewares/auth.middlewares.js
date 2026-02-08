import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"


export const verifyJWT = asyncHandler(async (req,_,next) =>{
    // get token from header or cookies

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401,"Unauthorized , token not found")
        }
    
        // verify token
        const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // find user by id from decoded token
    
        const user = await User.findById(decoded?._id).select("-password -refreshToken")

            if(!user){
                throw new ApiError(401,"Unauthorized , user not found")
            }
            
        // attach user to req object
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,"Unauthorized , invalid token")
    }


})