import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    registerUser,
    loginUser, logoutUser,
    changeCurrentPassword,
    getCurrentUesr,
    updateUserAvatar,
    updateAccountDetails,
} from "../controllers/user.controller.js"
import { upload } from '../middlewares/multer.middleware.js';

const userRoutes = Router();



//get only one user(loging)
userRoutes.post("/login", loginUser);


//create user(register)
userRoutes.post("/register", registerUser);


//logout user
userRoutes.post("/logout", verifyJWT, logoutUser)


//get current user
userRoutes.get("/current-user", verifyJWT, getCurrentUesr)


//edit user
// userRoutes.patch("/:id", userController.update);


//delete user
// userRoutes.delete("/:id", userController.delete);


//update password
userRoutes.patch("/password", verifyJWT, changeCurrentPassword);


//update and add avatar
userRoutes.patch("/avatar", upload.single("avatar"), updateUserAvatar);


//update and add dectiption 
userRoutes.patch("/updateDeteails",verifyJWT, updateAccountDetails);



//refresh-token of user
// userRoutes.post("/auth/refresh-token", userController.refreshToken);


export default userRoutes