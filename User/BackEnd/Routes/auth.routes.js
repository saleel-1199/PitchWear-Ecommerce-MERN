import express from "express";
import * as authController from "../Controller/auth.controller.js";
import *as userController from "../Controller/user.controller.js";
import { verifyOtp } from "../Services/auth.service.js";
import { isAuth } from "../Middlewares/auth.middleware.js";
import{attachUser} from "../Middlewares/attachUser.middleware.js"
import { uploadProfileImage } from "../Middlewares/upload.middleware.js";
import *as addressController from "../Controller/address.controller.js"


const router = express.Router();

router.route("/signup")
          .get(authController.renderSignup)
          .post(authController.signup);

router.post("/VerifyOtp",authController.verifyOtp)

router.route("/ForgotPassword")
         .get(authController.renderForgot)
         .post(authController.forgotPassword)

router.post("/VerifyForgotOtp",authController.verifyForgotOtp);

router.post("/ResetPassword",authController.resetPassword);


router.route("/login")
        .get(authController.renderLogin)
        .post(authController.login)
router.route("/Home")
        .get(isAuth,authController.renderHome)




router.get("/profile",isAuth,userController.renderUserProfile);

router.route("/profile/edit") 
       .get(isAuth, userController.renderEditProfile)
       .post (isAuth, userController.updateProfile);

router.route("/profile/change-email") 
       .get(isAuth, userController.renderChangeEmail)
       .post(isAuth, userController.sendEmailOtp);

router.route("/profile/verify-email-otp") 
        .get(isAuth,userController.renderVerifyEmailOtp)
        .post(isAuth, userController.verifyEmailOtp);


router.get("/logout",authController.logout)

router.post( "/profile/upload-photo", isAuth, uploadProfileImage.single("profileImage"), userController.uploadProfilePhoto );





router.get("/address",attachUser, isAuth, addressController.addressBookPage);


router.get("/address/new",attachUser, isAuth, addressController.addAddressPage);
router.post("/address",attachUser, isAuth, addressController.createAddressController);


router.get("/address/edit/:id",attachUser, isAuth, addressController.editAddressPage);
router.post("/address/edit/:id",attachUser, isAuth, addressController.updateAddressController);


router.get("/address/delete/:id", attachUser,isAuth, addressController.deleteAddressController);


export default router;
