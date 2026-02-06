import { Router } from "express"

import { ApiResponse } from "../utils/ApiResponse.js"
import { loginUser, logoutUser, registerUser ,refreshAccessToken, changeCurrenPassword, getCurrentUser, updateUserProfile, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controllers.js"

import { upload } from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()

router.post("/register", upload.fields([{
    name : 'avatar', maxCount : 1
},
{
    name : 'coverImage', maxCount : 1
}
]), registerUser)

router.post("/login",loginUser)

// secured routes 

router.post("/logout",verifyJWT,logoutUser)
router.post("/refresh-token",refreshAccessToken)
router.post("/change-password", verifyJWT, changeCurrenPassword)
router.post("/current-user",verifyJWT,getCurrentUser)
router.patch("/update-account",verifyJWT,updateUserProfile)
router.patch("/avatar",verifyJWT,upload.single("avatar"),updateUserAvatar)
router.patch("/cover-image",verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.get("/c/:username",verifyJWT,getUserChannelProfile)
router.get("/watch-history",verifyJWT,getWatchHistory)

export default router