const Product = require("../models/product");
const Order = require("../models/order");
const path = require("path");
const stripe = require("stripe")(
  "sk_test_51Nk8zVSCtF8V4hyauJYMsfbqtokrqf6puSr8TFlZ8ks15Nkp1x3KAPimwoEyY50qtWyO4UvPE5ffvUdoyYziYk5t00AxIdeQe9"
);

const fs = require("fs");
const PDFDocument = require("pdfkit");

const ITEMS_PER_PAGE = 2;

exports.getProducts = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const numOfProducts = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < numOfProducts,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(numOfProducts / ITEMS_PER_PAGE),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);
    res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/products",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const numOfProducts = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < numOfProducts,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(numOfProducts / ITEMS_PER_PAGE),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: user.cart.items,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const product = await Product.findById(prodId);
    await req.user.addToCart(product);
    res.redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    await req.user.removeFromCart(prodId);
    res.redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCartCheckout = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items;
    let totalSum = 0;
    products.forEach((p) => {
      totalSum += p.quantity * p.productId.price;
    });
    const session = await stripe.checkout.sessions.create({
      line_items: products.map((p) => ({
        price_data: {
          unit_amount: p.productId.price * 100, // amount in cents
          currency: "inr",
          product_data: {
            name: p.productId.title,
            description: p.productId.description,
          },
        },
        quantity: p.quantity,
      })),
      mode: "payment",
      success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
      cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
    });

    res.render("shop/checkout", {
      path: "/checkout",
      pageTitle: "Checkout",
      products: products,
      totalSum: totalSum,
      sessionId: session.id,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCheckoutSuccess = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items.map((i) => {
      return {
        quantity: i.quantity,
        product: { ...i.productId._doc },
      };
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user,
      },
      products: products,
    });
    await order.save();
    await req.user.clearCart();
    res.redirect("/orders");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.postOrder = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items.map((i) => {
      return {
        quantity: i.quantity,
        product: { ...i.productId._doc },
      };
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user,
      },
      products: products,
    });
    await order.save();
    await req.user.clearCart();
    res.redirect("/orders");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  const orders = await Order.find({ "user.userId": req.user._id });
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your Orders",
    orders,
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};

exports.getInvoice = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new Error("No order found"));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized"));
    }
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName);
    const pdfDoc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + invoiceName + '"'
    );
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("Invoice", {
      underline: true,
    });

    pdfDoc.text("--------------------------");
    let totalPrice = 0;
    order.products.forEach((prod) => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc
        .fontSize(14)
        .text(
          `${prod.product.title}-${prod.quantity} x Rs.${prod.product.price}`
        );
    });
    pdfDoc.text("--------------------------");
    pdfDoc.fontSize(20).text(`Total Price: Rs${totalPrice}`);
    pdfDoc.end();
  } catch (err) {}
};
