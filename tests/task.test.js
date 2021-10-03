const request = require("supertest");
const app = require("../src/app-init-express");
const Task = require("../src/models/task");

const {
  USER_ONE_ID,
  USER_ONE_TOKEN,
  USER_ONE,
  setupDataBase,
  VALID_NEW_USER,
  TASK_ONE_FOR_USER_ONE,
  USER_TWO_TOKEN,
} = require("./fixtures/db");

beforeEach(setupDataBase);

test("should create new task", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${USER_ONE_TOKEN}`)
    .send({ description: " watch the football match  " })
    .expect(201);

  //assertion to get task from db
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
});

test("should Get All USER_ONE tasks", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${USER_ONE_TOKEN}`)
    .expect(200);

  //assertion to know the number of USER_ONE tasks
  console.log(response.body.length);
  expect(response.body.length).toBe(2);
});

test("Should not delete other users tasks", async () => {
  const response = await request(app)
    .delete(`/tasks/${TASK_ONE_FOR_USER_ONE._id}`)
    .set("Authorization", `Bearer ${USER_TWO_TOKEN}`)
    .expect(400);
  const task = await Task.findById(TASK_ONE_FOR_USER_ONE._id);
  expect(task).not.toBeNull();
});
