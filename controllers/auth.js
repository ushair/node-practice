const bcrypt = require("bcryptjs");
const emailjs = require("@emailjs/nodejs");

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
    console.log("🚀 ~ exports.postLogin= ~ doMatch:", doMatch);
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
      text: "Thank you for signing up!",
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
