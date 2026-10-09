const asyncHandler =(requestHandelar)=>{
   return (req,res,next)=>{
        // Wraps the async request handler in a Promise and forwards any errors to Express's error handler
        Promise.resolve(requestHandelar(req,res,next)).catch((err)=>next(err))
    }
}
    

export { asyncHandler } // Exporting asyncHandler for use in other modules
