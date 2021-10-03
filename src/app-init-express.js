const express = require("express");
//import from files
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();

/// conifgure the express application
app.use(express.json()); // this line help us to auto convery the incoming body "json" to Object.
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
