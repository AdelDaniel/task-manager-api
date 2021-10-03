const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const USER_ONE_ID = new mongoose.Types.ObjectId();
const USER_ONE_TOKEN = jwt.sign(
  { _id: USER_ONE_ID.toString() },
  process.env.JWT_SECRET
);
const USER_ONE = {
  _id: USER_ONE_ID,
  name: "USER_ONE",
  age: 25,
  email: "USER_ONE@gmail.com",
  password: "USER_ONE",
  tokens: [{ token: USER_ONE_TOKEN }],
};

const USER_TWO_ID = new mongoose.Types.ObjectId();
const USER_TWO_TOKEN = jwt.sign(
  { _id: USER_TWO_ID.toString() },
  process.env.JWT_SECRET
);
const USER_TWO = {
  _id: USER_TWO_ID,
  name: "USER_TWO",
  age: 22,
  email: "USER_TWO@gmail.com",
  password: "USER_TWO",
  tokens: [{ token: USER_TWO_TOKEN }],
};

const VALID_NEW_USER = {
  name: "testing",
  age: 25,
  email: "testing@gmail.com",
  password: "testing",
};

const TASK_ONE_FOR_USER_ONE = {
  _id: mongoose.Types.ObjectId(),
  ownerId: USER_ONE_ID,
  description: "This iS TASK_ONE_FOR_USER_ONE",
};
const TASK_TWO_FOR_USER_TWO = {
  _id: mongoose.Types.ObjectId(),
  ownerId: USER_TWO_ID,
  description: "This is TASK_TWO_FOR_USER_TWO ",
};
const TASK_THREE_FOR_USER_ONE = {
  _id: mongoose.Types.ObjectId(),
  ownerId: USER_ONE_ID,
  description: "This is TASK_THREE_FOR_USER_ONE",
};

const setupDataBase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await User.create(USER_ONE);
  await new User(USER_TWO).save();
  await new Task(TASK_ONE_FOR_USER_ONE).save();
  await new Task(TASK_TWO_FOR_USER_TWO).save();
  await new Task(TASK_THREE_FOR_USER_ONE).save();
};

module.exports = {
  USER_ONE_ID,
  USER_ONE_TOKEN,
  USER_ONE,
  setupDataBase,
  VALID_NEW_USER,
  USER_TWO_ID,
  USER_TWO_TOKEN,
  USER_TWO,
  TASK_ONE_FOR_USER_ONE,
};
