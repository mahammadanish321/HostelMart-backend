
import { ApiError } from "../utils/ApiError.js"; //for handaling error
import { asyncHandler } from "../utils/asyncHandler.js"; //for handaling async
import jwt from "jsonwebtoken";  //importing for verifin token
import {User} from "../models/user.model.js"; // using user method 


export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request - No token provided")
        }
        
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
     
        

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken") //unselect the password and refreshtoken becuse we dont need thad in this point 


    
        if (!user) {
            throw new ApiError(401, "Invalid token - User not found")
        }
         
        req.user = user;
        next(); 
        
    } catch (error) {
    
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid token format")
        }
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, "Token has expired")
        }
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})