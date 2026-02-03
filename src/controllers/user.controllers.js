import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'


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

    const { fullname, email, username, password } = req.body

    if ([fullname, email, username, password].some(fields => fields?.trim() === "")) {
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
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }

    // upload them to cloudinary

    const avatarUrl = await uploadOnCloudinary(avatarLocalPath).url

    const coverImageUrl = await uploadOnCloudinary(coverImageLocalPath).url

    if (!avatarUrl) {
        throw new ApiError(400, "Avatar file is required ")
    }

    // create user object and create entry in db

    const user = await User.create({
        fullname,
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
    
export { registerUser }