const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const isValidId = require("../utils/id-validation");

const router = new express.Router();

router.post("/tasks", auth, async (req, res) => {
  const newTask = new Task({ ...req.body, ownerId: req.user._id });
  try {
    const result = await newTask.save();
    res.status(201).send(result);
    console.log(`Task Added: ${result}`);
  } catch (error) {
    res.status(400);
    res.send(error);
    console.log(`Oops! the task not added: ${error}`);
  }
});

// GET / tasks?isCompeleted=true
// GET / tasks?limit=10&skip=0
// GET / sortBy=createdAt:desc // sortby takes 2 values and split them with any special char like ":"
//? limit :: used to limit the number of results we have been request
//? skip ::  to choose how many task we need to skip to load more

router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.isCompeleted) {
    match.isCompeleted = req.query.isCompeleted === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    const loggedInUser = req.user;
    await loggedInUser.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.status(200).send(loggedInUser.tasks);
    console.log(`Tasks Fetched Successfully`);
  } catch (error) {
    res.status(500).send({ error });
    console.log(`Some error Happened During get all tasks: ${error}`);
  }
});

router.get("/tasks/:id", auth, (req, res) => {
  const _id = req.params.id;
  if (!isValidId(_id, res)) return;

  Task.findOne({ _id, ownerId: req.user._id })
    .then((result) => {
      if (!result) {
        res.status(404).send({ error: "The Task with that ID Not Found" });
        return console.log(`The Task with that id Not Found`);
      }
      res.send(result);
      console.log(`The Task Found && Fetched Successfully ${result}`);
    })
    .catch((error) => {
      res.status(500).send(error);
      console.log(`Some Error Happened: ${error}`);
    });
});

router.patch("/tasks/:id", auth, async (req, res) => {
  let errorMsg;
  const _id = req.params.id;
  if (!isValidId(_id, res)) return;
  const allNewUpdates = Object.keys(req.body);
  const allowedUpdates = ["description", "isCompeleted"];
  const isValidUpdates = allNewUpdates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdates) {
    errorMsg = "Not Allowed to Update this values";
    res.status(400).send({
      error: errorMsg,
      valuesAllowed: `"description", "isCompeleted"`,
    });
    return console.log(errorMsg);
  }
  try {
    const updatedTask = await Task.findOne({ _id, ownerId: req.user._id });
    if (!updatedTask) {
      errorMsg = "Something went Wrong, Check for ID";
      res.status(400).send({ error: errorMsg });
      return console.log(errorMsg);
    }

    allNewUpdates.forEach((update) => (updatedTask[update] = req.body[update]));
    await updatedTask.save();

    res.status(200).send(updatedTask);
    return console.log(`updated Successfully: ${updatedTask}`);
  } catch (error) {
    errorMsg = `Some Error Happened: ${error}`;
    res.status(500).send({ error: errorMsg });
    console.log(errorMsg);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  let errorMsg;
  const _id = req.params.id;
  if (!isValidId(_id, res)) return;

  try {
    const deletedTask = await Task.findOneAndDelete({
      _id,
      ownerId: req.user._id,
    });
    if (!deletedTask) {
      errorMsg = "Something went Wrong, Check for ID";
      res.status(400).send({ error: errorMsg });
      return console.log(errorMsg);
    }
    res.status(200).send(deletedTask);
    return console.log(`Deleted Successfully: ${deletedTask}`);
  } catch (error) {
    errorMsg = `Some Error Happened: ${error}`;
    res.status(500).send({ error: errorMsg });
    console.log(errorMsg);
  }
});

module.exports = router;
