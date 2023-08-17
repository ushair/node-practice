const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://ushair:Sheeba%40143@cluster0.cnywq1v.mongodb.net/shop?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(uri)
    .then((client) => {
      console.log("Connected to MongoDB!");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) return _db;
  throw "No Database Found!!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
