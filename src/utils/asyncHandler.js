// const asyncHandler = (requestHandler)=>async (req,res,next)=>{
//   Promise.resolve(requestHandler(req,res,next)).catch((error)=>next(error));
// }



// a higher order function to handle async errors in express routes 
const asyncHandler = (fn) => async (req,res,next)=>{
    try {
         return await fn(req,res,next)
    } catch (error) {
         return res.status(error.code  || 500).json({
            success : false,
            message : error.message || "Internal Server Error"
        })
    }
}

export { asyncHandler }