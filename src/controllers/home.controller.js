import { asyncHandler } from "../utils/asyncHandler.js"

const homeRouteHandler = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "Welcome to Home Route"
    })
})

export { homeRouteHandler }