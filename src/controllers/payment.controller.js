import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import Razorpay from "razorpay"
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";
import { transporter } from "../config/emailConfig.js";



// Lazy initialization of Razorpay
let razorpayInstance = null;
const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new ApiError(500, "Razorpay credentials are not configured");
        }
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
    return razorpayInstance;
};

const paymentRouteHandler = asyncHandler(async (req, res) => {
    // create order 

    // // Check if body exists
    // if (!req.body) {
    //     throw new ApiError(400, "Request body is missing. Please send data with Content-Type: application/json");
    // }

    // if (Object.keys(req.body).length === 0) {
    //     throw new ApiError(400, "Request body is empty. Please send amount, currency, and receipt");
    // }

    const { amount, currency, receipt } = req.body

    if (!amount || !currency || !receipt) {
        throw new ApiError(400, "Amount, currency and receipt are required")
    }

    const options = {
        amount: amount * 100, // amount in paise    
        currency,
        receipt
    }

    try {
        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create(options)

        if (!order) {
            throw new ApiError(500, "Failed to create order")
        }

        return res
            .status(201)
            .json(new ApiResponse(201, order, "Order created successfully"));

    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while creating order")
    }
})

const paymentVerificationHandler = asyncHandler(async (req, res) => {
    // verify payment signature

    if (!req.body) {
        throw new ApiError(400, "Request body is missing. Please send payment verification data");
    }

    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            throw new ApiError(400, "Payment ID, Order ID and Signature are required");
        }

        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex')


        if (generated_signature === razorpay_signature) {
            return res.status(200).json(new ApiResponse(200, {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                verified: true
            }, "Payment verified successfully"))
        } else {
            throw new ApiError(400, "Invalid payment signature. Payment verification failed");
        }
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while verifying payment")
    }

})

const sendPaymentEmail = asyncHandler(async (req, res) => {
    // Implement email sending logic here using nodemailer or any email service
    // You can use orderDetails to include relevant information in the email

    const { email, name, amount, paymentId } = req.body;

    try {


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Payment Confirmation',
            text: `Hello ${name},\n\nYour payment of ₹${amount} has been successfully processed. Your payment ID is ${paymentId}.\n\nThank you for your purchase!`
        }

        await transporter.sendMail(mailOptions);

        console.log(`Payment confirmation email sent to ${email}`);
        return res.status(200).json(new ApiResponse(200, null, "Payment confirmation email sent successfully"))
    } catch (error) {
        throw new ApiError(400, "Something went wrong while sending payment confirmation email")
    }
})


export { paymentRouteHandler, paymentVerificationHandler, sendPaymentEmail }