import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'
import { upload } from '../middlewares/multer.middlewares.js'




const generateAccessAndRefreshTokens = async (userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    //get user deatils as per requirements
    // validation - not empty
    //check if user already exists : username, email
    // check for images , avatar
    //upload them to cloudinary - avatar
    // create user object and create entry in db 
    // remove password and refresh token from response
    // check for user creation success
    // return response 

    const { fullName, email, username, password } = req.body

    if ([fullName, email, username, password].some(fields => fields?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    // check if user already exists
    const existedUser = await User.findOne({
        $or: [{
            email: email
        }, {
            username: username
        }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists with given email or username")
    }

    // check for images 
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }

    // upload them to cloudinary

    const avatarResult = await uploadOnCloudinary(avatarLocalPath)
    const avatarUrl = avatarResult?.url

    let coverImageUrl = ""
    if (coverImageLocalPath) {
        const coverImageResult = await uploadOnCloudinary(coverImageLocalPath)
        coverImageUrl = coverImageResult?.url || ""
    }

    if (!avatarUrl) {
        throw new ApiError(400, "Avatar file is required ")
    }

    // create user object and create entry in db

    const user = await User.create({
        fullName,
        email,
        username,
        password,
        avatar: avatarUrl,
        coverImage: coverImageUrl ? coverImageUrl : ""
    })

    // remove password and refresh token from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "User registration failed")
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"))

})


// login user 

const loginUser = asyncHandler(async (req, res) => {
    // req body-> data
    // username or email 
    // find the user 
    // password comparison
    // access token and refresh token generation 
    // send cookies 

    const { email, username, password } = req.body


    if(!username && !email){
        throw new ApiError(400, "Username or email is required")
    }

    // if (!username || !email) {
    //     throw new ApiError(400, "Username or email is required")
    // }

    const user = await User.findOne({
        $or: [
            { email: email },
            { username: username }
        ]
    })


    if (!user) {
        throw new ApiError(404, "User not found with given email or username")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Credentials")
    }

    // if valid credentials generate tokens 

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // send cookies

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).cookie("refreshToken", refreshToken, cookieOptions).cookie("accessToken", accessToken, cookieOptions).json(new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
    }, "User logged in successfully"
    ))


})

// logout user 

const logoutUser = asyncHandler(async (req, res) => {
    // find user from req.userId
    // remove refresh token from db
    // remove cookies 
    // send response

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        { new: true })


        const cookieOptions = {
            httpOnly: true,
            secure: true,
        }

   return  res.status(200)
   .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    //get refresh token from cookies
    // validate refresh token 
    // generate new access token and refresh token 
    // update refresh token in db
    // send response with new tokens and cookies

try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!incomingRefreshToken){
            throw new ApiError(401, "Refresh token is required , unauthorized access")
        }
    
        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id)
    
        if(!user){
            throw new ApiError(401, "User not found , unauthorized access")
        }   
    
        if(user.refreshToken !== incomingRefreshToken){
            throw new ApiError(401, "Invalid refresh token , unauthorized access")
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        const cookieOptions = {
            httpOnly: true,
            secure: true,
        }
    
        return res.status(200).cookie("refreshToken", refreshToken, cookieOptions).cookie("accessToken", accessToken, cookieOptions).json(new ApiResponse(200, {
            accessToken,
            refreshToken
        }, "Access token refreshed successfully"))
} catch (error) {
    throw new ApiError(401,error?.message || "something went wrong while refreshing access token")
}


})

const changeCurrenPassword = asyncHandler(async (req,res)=>{
    // get old password and new password from req body
    // validate them 
    // find user from req.userId
    // compare current password 
    // if matches update with new password 
    // send response

   const { oldPassword , newPassword , confirmPassword } = req.body

   const user = await User.findById(req.user?._id)

   if(!user){
    throw new ApiError(404,"User not found")
   }

   const isOldPasswordValid = await user.isPasswordCorrect(oldPassword)

   if(!isOldPasswordValid){
    throw new ApiError(401,"Invalid current password")
   }

   if(newPassword !== confirmPassword){
    throw new ApiError(400, "New password and confirm password do not match")
   }

   user.password = newPassword

   await user.save({validateBeforeSave : false})

   return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"))

})

const getCurrentUser = asyncHandler(async (req,res) =>{
    // find user from req.userId
    // send response with user details except password and refresh token


    // already have user details in req.user from verifyJWT middleware, we can directly send that in response after removing password and refresh token

    const user = req.user

    // const user = await User.findById(req.user?._id).select("-password -refreshToken")

    // if(!user){
    //     throw new ApiError(404,"User not found")
    // }

    return res.status(200).json(new ApiResponse(200, user, "User details fetched successfully"))

})

const updateUserProfile = asyncHandler(async (req,res) =>{
    // get user details from req body
    // validate them 
    // find user from req.userId
    // update user details 
    // send response with updated user details except password and refresh token

    const { fullName, username, email } = req.body

    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(404,"User not found")
    }

    user.fullName = fullName || user.fullName
    user.username = username || user.username
    user.email = email || user.email

    await user.save({validateBeforeSave : false})

    const updatedUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, updatedUser, "User profile updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req,res) =>{
    // get avatar file from req file
    // validate it 
    // find user from req.userId
    // upload new avatar to cloudinary and get url
    // update user avatar with new url 
    // send response with updated user details except password and refresh token

           const avatarLocalPath =  req.file?.path 
           if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is required")
           }

          const avatar =  await uploadOnCloudinary(avatarLocalPath)

          if(!avatar?.url){
            throw new ApiError(500,"Something went wrong while uploading avatar")
          }

            const user = await User.findByIdAndUpdate(req.user?._id, { $set : { avatar: avatar.url } }, { new: true }).select("-password -refreshToken")

            if(!user){
                throw new ApiError(404,"User not found")
            }

            return res.status(200).json(new ApiResponse(200, user, "User avatar updated successfully"))
})


const updateUserCoverImage = asyncHandler(async (req,res) =>{
    // get cover image file from req file
    // validate it
    // find user from req.userId
    // upload new cover image to cloudinary and get url
    // update user cover image with new url 
    // send response with updated user details except password and refresh token

     const coverImageLocalPath =  req.file?.path 
           if(!coverImageLocalPath){
            throw new ApiError(400,"Cover image file is required")
           }

          const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

          if(!coverImage?.url){
            throw new ApiError(500,"Something went wrong while uploading cover image")
          }

            const user = await User.findByIdAndUpdate(req.user?._id, { $set : { coverImage: coverImage.url } }, { new: true }).select("-password -refreshToken")

            if(!user){
                throw new ApiError(404,"User not found")
            }

            return res.status(200).json(new ApiResponse(200, user, "User cover image updated successfully"))
})



export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrenPassword, getCurrentUser, updateUserProfile, updateUserAvatar, updateUserCoverImage } 