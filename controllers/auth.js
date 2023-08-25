const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getLogin = async (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

exports.getSignup = async (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
  });
};

exports.postLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email });
    if (!user) {
      return res.redirect("/login");
    }
    const doMatch = bcrypt.compare(password, user.password);
    if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        res.redirect("/");
      });
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
      return res.redirect("/signup");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      cart: { item: [] },
    });
    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.log("🚀 ~ exports.postSignup= ~ error:", error);
  }
};
