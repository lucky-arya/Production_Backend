import { Router } from "express"
import { paymentRouteHandler,paymentVerificationHandler, sendPaymentEmail } from "../controllers/payment.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"


const router  = Router()

// Production routes
router.post("/create-order" ,  paymentRouteHandler) 
router.post("/payment/verify" , paymentVerificationHandler) 
router.post("/payment/confirmation-email",  sendPaymentEmail)

// // Test route - Only enabled in development
// if (process.env.NODE_ENV !== 'production') {
//     router.post("/test/generate-signature", generateTestSignature)
// }

export default router