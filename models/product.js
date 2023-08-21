const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);

// const mongodb = require("mongodb");
// const getDb = require("../util/database").getDb;

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   async save() {
//     const db = getDb();
//     try {
//       if (this._id) {
//         return await db
//           .collection("products")
//           .updateOne({ _id: this._id }, { $set: this });
//       } else {
//         return await db.collection("products").insertOne(this);
//       }
//     } catch (err) {
//       console.log(err);
//     }
//     return db
//       .collection("products")
//       .insertOne(this)
//       .then((res) => console.log(res))
//       .catch((err) => console.log(err));
//   }

//   static async fetchAll() {
//     const db = getDb();
//     return await db.collection("products").find().toArray();
//   }

//   static async findById(prodId) {
//     const db = getDb();
//     return await db
//       .collection("products")
//       .find({ _id: new mongodb.ObjectId(prodId) })
//       .next();
//   }

//   static async deleteById(prodId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) });
//   }
// }

// module.exports = Product;
