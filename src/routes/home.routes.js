import { Router } from "express"

import { ApiResponse } from "../utils/ApiResponse.js"
import { homeRouteHandler } from "../controllers/home.controller.js"



const router = Router()

router.get("/",homeRouteHandler)

export default router