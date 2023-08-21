// const getDb = require("../util/database").getDb;
// const mongodb = require("mongodb");
// const { get } = require("../routes/shop");
// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   async save() {
//     const db = getDb();
//     return await db.collection("users").insertOne(this);
//   }

//   async addToCart(product) {
//     const db = getDb();
//     const cartProductIndex = this.cart.items.findIndex((cp) => {
//       return cp.productId.toString() === product._id.toString();
//     });
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];
//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new mongodb.ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }
//     const updatedCart = {
//       items: updatedCartItems,
//     };
//     return await db
//       .collection("users")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   async getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map((i) => i.productId);
//     const products = await db
//       .collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray();
//     return products.map((p) => {
//       return {
//         ...p,
//         quantity: this.cart.items.find((i) => {
//           return i.productId.toString() === p._id.toString();
//         }).quantity,
//       };
//     });
//   }

//   async deleteItemFromCart(productId) {
//     const db = getDb();
//     const updatedCartItems = this.cart.items.filter(
//       (item) => item.productId.toString() !== productId.toString()
//     );
//     return await db
//       .collection("users")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: { items: updatedCartItems } } }
//       );
//   }

//   async addOrder() {
//     const db = getDb();
//     const cartProducts = await this.getCart();
//     const order = {
//       items: cartProducts,
//       user: {
//         _id: new mongodb.ObjectId(this._id),
//         name: this.name,
//       },
//     };
//     await db.collection("orders").insertOne(order);
//     return await db
//       .collection("users")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: { items: [] } } }
//       );
//   }

//   async getOrders() {
//     const db = getDb();
//     return await db
//       .collection("orders")
//       .find({ "user._id": new mongodb.ObjectId(this._id) })
//       .toArray();
//   }

//   static async findById(userId) {
//     const db = getDb();
//     return await db
//       .collection("users")
//       .findOne({ _id: new mongodb.ObjectId(userId) });
//   }
// }

// // const Sequelize = require("sequelize");
// // const sequelize = require("../util/database");

// // const User = sequelize.define("user", {
// //   id: {
// //     type: Sequelize.INTEGER,
// //     autoIncrement: true,
// //     allowNull: false,
// //     primaryKey: true,
// //   },
// //   name: {
// //     type: Sequelize.STRING,
// //     allowNull: false,
// //   },
// //   email: {
// //     type: Sequelize.STRING,
// //     allowNull: false,
// //   },
// // });

// module.exports = User;
