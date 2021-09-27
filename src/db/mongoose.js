const mongoose = require("mongoose");
require("dotenv").config();

const connectionURL = process.env.MONGODB_URL; // connect local host server and the database name you want

mongoose.connect(`${connectionURL}`, {
  useNewUrlParser: true,
});
