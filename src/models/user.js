const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const Task = require("./task");
// require("dotenv").config();

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      validate: (value) => {
        if (value.length < 3) {
          throw new Error(`too short name: ${value} is less than 3 characters`);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate: (value) => {
        if (value.length < 6) {
          throw new Error(`too short password: it must be 6 letters or more!`);
        } else if (value.toLowerCase().includes("password")) {
          throw new Error(`the password key must not contains "password"!`);
        } else if (value.includes(" ")) {
          throw new Error(`the password key must not contains "space"!`);
        }
      },
    },
    email: {
      type: String,
      unique: true, // so no 2 users with same mail
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(`${value} is not a vaild email`);
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    age: { type: Number, min: 13, index: true, max: 100 },
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

//virtual property :: realationship between 2 entities
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "ownerId",
});

// this function delete the password and tokens before return the user to the client
// you don't need to call to json in the route handler
userSchema.methods.toJSON = function () {
  const user = this;
  const returnedUserData = user.toObject();

  // these 3 fields will not returned  in profile response
  delete returnedUserData.password;
  delete returnedUserData.tokens;
  delete returnedUserData.avatar;

  return returnedUserData;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;

  // the first object is unique identifer for the user
  // the second arg is secret >> used to sign the token
  var token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save(); //to save the user in db
  return token;
};

// the findByCredentials method not in the documentation of mongoose but i add it
// this used to login
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Oops! unable to get the user");
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error("Oops! unable to get the user");
  }
  return user;
};

// hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//  delete the user tasks when the user want to deactivate his account
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ ownerId: user._id });
  next();
});
const User = mongoose.model("User", userSchema);
module.exports = User;
