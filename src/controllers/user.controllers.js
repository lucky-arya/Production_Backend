import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'




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
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken || req.headers("Authorization").replace("Bearer ","")
    
        if(!incomingRefreshToken){
            throw new ApiError(401, "Refresh token is required , unauthorized access")
        }
    
        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id)
    
        if(!user){
            throw new ApiError(401, "User not found , unauthorized access")
        }   
    
        if(!user) {
            throw new ApiError(401, "User not found , Invalid refresh token")
        }
    
        if(user.refreshToken !== incomingRefreshToken){
            throw new ApiError(401, "Invalid refresh token , unauthorized access")
        }
    
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        const cookieOptions = {
            httpOnly: true,
            secure: true,
        }
    
        return res.status(200).cookie("refreshToken", newrefreshToken, cookieOptions).cookie("accessToken", accessToken, cookieOptions).json(new ApiResponse(200, {
            accessToken,
            refreshToken: newrefreshToken
        }, "Access token refreshed successfully"))
} catch (error) {
    throw new ApiError(401,error?.message || "something went wrong while refreshing access token")
}


})
export { registerUser, loginUser, logoutUser, refreshAccessToken }