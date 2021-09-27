const mongoose = require("mongoose");
require("dotenv").config();

const connectionURL = process.env.MONGODB_URL; // connect local host server
const databaseName = process.env.MONGODB_NAME; // the database name you want

mongoose.connect(`${connectionURL}/${databaseName}`, {
  useNewUrlParser: true,
});
