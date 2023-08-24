const User = require("../models/user");

exports.getLogin = async (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

exports.postLogin = async (req, res, next) => {
  try {
    const user = await User.findById("64e4fe6c4b86596ac8e8badc");
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save((err) => {
      res.redirect("/");
    });
  } catch (error) {
    console.log("🚀 ~ exports.postLogin= ~ error:", error);
  }
};

exports.postLogout = async (req, res, next) => {
  await req.session.destroy((err) => {
    console.log("🚀 ~ awaitreq.session.destroy ~ err:", err);
    res.redirect("/");
  });
};
