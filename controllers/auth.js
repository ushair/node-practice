const bcrypt = require("bcryptjs");
const emailjs = require("@emailjs/nodejs");
const crypto = require("crypto");

const User = require("../models/user");

emailjs.init({
  publicKey: "7H27yf9ZXFWwvau6c",
  privateKey: "mBiOQt2DcdNcrNN69mVjy",
});

exports.getLogin = async (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: req.flash("error"),
  });
};

exports.getSignup = async (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: req.flash("error"),
  });
};

exports.postLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }
    const doMatch = await bcrypt.compare(password, user.password);
    if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        res.redirect("/");
      });
    } else {
      req.flash("error", "Invalid email or password.");
      res.redirect("/login");
    }
  } catch (error) {
    console.log("🚀 ~ exports.postLogin= ~ error:", error);
    res.redirect("/login");
  }
};

exports.postLogout = async (req, res, next) => {
  await req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.postSignup = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const userDoc = await User.findOne({ email });
    if (userDoc) {
      req.flash("error", "Email already exists.");
      return res.redirect("/signup");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      cart: { item: [] },
    });
    await user.save();

    // Sending welcome email using emailjs
    const emailContent = {
      from: "shop-email@shop.com",
      to: email,
      subject: "Welcome to Our Website!",
      html: "<h1>Thank you for signing up!<h1>",
    };

    const emailResponse = await emailjs.send(
      "service_3txf7fc",
      "template_276lfmq",
      emailContent
    );
    console.log("Email sent:", emailResponse);
    res.redirect("/login");
  } catch (error) {
    console.log("🚀 ~ exports.postSignup= ~ error:", error);
  }
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: req.flash("error"),
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, async (err, buffer) => {
    try {
      if (err) {
        console.log(err);
        return res.redirect("/reset");
      }
      const token = buffer.toString("hex");
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        req.flash("error", "No account found with that email.");
        return res.redirect("/reset");
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      await user.save();
      const emailContent = {
        from: "shop-email@shop.com",
        to: req.body.email,
        subject: "Password Reset",
        html: `
        <p>You requested a password reset</p>
        <p>Click this <a href='http://localhost:3000/reset/${token}'>link to set a new password</p>
        `,
      };

      const emailResponse = await emailjs.send(
        "service_3txf7fc",
        "template_276lfmq",
        emailContent
      );
      console.log("Reset Email sent:", emailResponse);
      res.redirect("/");
    } catch (err) {
      console.log("🚀 ~ .postReset ~ err:", err);
    }
  });
};

exports.getNewPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      errorMessage: req.flash("error"),
      userId: user._id.toString(),
      passwordToken: token,
    });
  } catch (error) {
    console.log("🚀 ~ exports.getNewPassword= ~ error:", error);
  }
};

exports.postNewPassword = async (req, res, next) => {
  try {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.log("🚀 ~ postNewPassword error:", error);
  }
};
