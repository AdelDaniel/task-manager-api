const request = require("supertest");
const app = require("../src/app-init-express");
const User = require("../src/models/user");
const {
  USER_ONE_ID,
  USER_ONE_TOKEN,
  USER_ONE,
  VALID_NEW_USER,
  setupDataBase,
} = require("./fixtures/db");

// Know more about beforEach from here :: https://jestjs.io/docs/setup-teardown
beforeEach(setupDataBase);

test("should sign up a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send(VALID_NEW_USER)
    .expect(201)
    .expect("Content-Type", /json/);

  //Another Assertion to check user is stored in db
  const userSaved = await User.findOne({
    name: VALID_NEW_USER.name,
    age: VALID_NEW_USER.age,
    email: VALID_NEW_USER.email,
  });
  expect(userSaved).not.toBeNull();

  // 3rd Assertion to check  password is not Stored as it is in the db
  expect(userSaved.password).not.toBe(VALID_NEW_USER.password);
});

test("should log in existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({ email: USER_ONE.email, password: USER_ONE.password })
    .expect(200)
    .expect("Content-Type", /json/);

  //2nd assertion the token in db is the same in response
  const user = await User.findById(USER_ONE_ID);
  expect(user.tokens[1].token).toBe(response.body.token);
});

test("should not log in existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({ name: "king", password: "kingskings" })
    .expect(400)
    .expect("Content-Type", /json/);
});

test("should get user profile!", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${USER_ONE_TOKEN}`)
    .expect(200);
});

test("should not get user profile >> not Authanticated User!", async () => {
  await request(app).get("/users/me").expect(401);
});

test("should Delete user account!", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${USER_ONE_TOKEN}`)
    .expect(200);

  //2nd assertion :: make sure that user not stored in db
  const user = await User.findById(USER_ONE_ID);
  expect(user).toBeNull();
});

test("should Not Delete user account >> not Authanticated User!", async () => {
  await request(app).delete("/users/me").expect(401);
});

test("should Upload Avatar Image!", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${USER_ONE_TOKEN}`)
    .attach("avatar", "tests/fixtures/tom.jpg")
    .expect(200);

  const user = await User.findById(USER_ONE_ID);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("should Update Valid user name!", async () => {
  const newName = "New Name";
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${USER_ONE_TOKEN}`)
    .send({ name: newName })
    .expect(200);

  const user = await User.findById(USER_ONE_ID);
  expect(user.name).toBe(newName);
});

test("should Not Update the location because it not exist in fields!", async () => {
  const newName = "New Name";
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${USER_ONE_TOKEN}`)
    .send({ location: "10000" })
    .expect(400);
});
