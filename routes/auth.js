const express = require("express");
const { check, body } = require("express-validator");
const router = express.Router();

const User = require("../models/user");
const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);

router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid Email")
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (!userDoc) {
          throw new Error("Invalid Email or Password");
        }
        return true;
      })
      .normalizeEmail(),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid Email")
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          throw new Error("Email already exists.");
        }
        return true;
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password does not match");
        }
        return true;
      }),
  ],
  authController.postSignup
);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
