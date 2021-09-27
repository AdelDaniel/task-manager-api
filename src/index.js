const express = require("express");
//import from files
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

/// conifgure the express application
app.use(express.json()); // this line help us to auto convery the incoming body "json" to Object.
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(`Server Is On port: ${port}`);
});
