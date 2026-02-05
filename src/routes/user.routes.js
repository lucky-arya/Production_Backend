import { Router } from "express"

import { ApiResponse } from "../utils/ApiResponse.js"
import { loginUser, logoutUser, registerUser ,refreshAccessToken } from "../controllers/user.controllers.js"

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


export default router