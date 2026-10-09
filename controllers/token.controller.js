import { asyncHandler } from '../utils/asyncHandler.js'; //importing asyncHandler utility function to handle asynchronous operations in route handlers 
import { ApiError } from '../utils/ApiError.js'; //importing ApiError class for consistent API error handling
import { User } from '../models/user.model.js'; //importing User model to interact with user data in the database
// import { uploadOnCloudinary } from '../utils/cloudnary.js'; //importing uploadOnCloudinary function to handle file uploads to Cloudinary
import { ApiResponce } from '../utils/ApiResponce.js'; //importing ApiResponce class for standardized API responses
import jwt from "jsonwebtoken";  //importing for verifin token



//generate AccessAndRe freshToken
export const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()



        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false});

        return { accessToken, refreshToken }

    }catch(err){
        throw new ApiError(500, "sonthing went wrong while generating assess and refresh token")
    }

}





export const refreshAccessToken = asyncHandler(async (req, res) => {

    //
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken //take the refreshToken form either cookie or body.


    //if incoming token is not avalable then throw a error 
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorize request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        // console.log("Decoded token:", decodedToken); // Debug log


        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "invalid user")
        }
        // console.log ("SEE HEAR:",user)

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refreash token is expaieard or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { newRefreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponce(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token is refresheed succesfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})