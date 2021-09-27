const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const auth = async (req, res, next) => {
  console.log("auth middleware");
  try {
    const token = req.header("authorization").substring(7);
    const decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decodedJwt._id,
      "tokens.token": token,
    }); //find the user depending on the id and if the token exist in the tokens
    if (!user) {
      throw new Error("No User Exist!");
    }
    // console.log(user.name);

    req.user = user; // add property user wiht value user to the request to not fetch the user form db again
    req.token = token;

    next();
  } catch (error) {
    res.status(401).send(`Not Authanticated Correctly! ${error}`);
  }
};

module.exports = auth;
