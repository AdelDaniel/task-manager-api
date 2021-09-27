const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

// only login and signup are public
// the next are authanticated not avaliabel for any one
// so loagin will sent back the auth token
// then we use jwt json web token
// tokens expire after some time

router.post("/users", async (req, res) => {
  /// Saving The New User to DataBase
  const newUser = new User(req.body);
  try {
    const token = await newUser.generateAuthToken();
    await newUser.save();
    sendWelcomeEmail(newUser.name, newUser.email);
    res.status(201).send({ newUser, token });
    console.log(`success: ${newUser}`);
  } catch (error) {
    res.status(400);
    res.send(error);
    console.log(`Fail The user didn't inserted: ${error}`);
  }
});

//find the user by mail and pass
//help the user to login
// the end point /user/login
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    // const returnedUser = user.getPublicProfile(); // remove tokens and password
    res.send({ user, token });
    console.log("user is found successfuly ");
  } catch (err) {
    res.status(400).send({ err });
    console.log(err);
  }
});

// logout the user from one device
router.post("/users/logout", auth, async (req, res) => {
  // here we logout only from one device phone or laptop (not all)
  // only from the device, user tried to logout from
  // so remove that token coming in req.token >> from tokens list
  try {
    req.user.tokens = req.user.tokens.filter((tokenItem) => {
      return tokenItem.token !== req.token;
    });

    await req.user.save();
    res.status(200).send("user is Logedout successfuly!!");
    console.log(req.user);
    console.log("user is Logedout successfuly ");
  } catch (error) {
    res.status(400).send({ error });
    console.log({ error });
  }
});

// logout the user from all devices
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send("user is Logedout From all devices successfuly!!");
    console.log(req.user);
    console.log("user is Logedout From all devices successfuly!! ");
  } catch (error) {
    res.status(400).send({ error });
    console.log({ error });
  }
});

router.get("/users/me", auth, (req, res) => {
  // we will send back the auth profile;
  res.send(req.user);
});

router.patch("/users/me", auth, async (req, res) => {
  let errorMsg;

  const allNewUpdates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidUpdates = allNewUpdates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdates) {
    errorMsg = "Not Allowed to Update this values";
    res.status(400).send({
      error: errorMsg,
      valuesAllowed: `"name", "email", "password", "age"`,
    });
    return console.log(errorMsg);
  }
  try {
    const updatedUser = req.user;
    allNewUpdates.forEach((update) => (updatedUser[update] = req.body[update]));
    await updatedUser.save();
    res.status(200).send(updatedUser);
    return console.log(`the User updated Successfully: ${updatedUser}`);
  } catch (error) {
    errorMsg = `Some Error Happened: ${error}`;
    res.status(500).send({ error: errorMsg });
    console.log(errorMsg);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  // here we will delete the user only
  // in middleware we going to delete the user tasks :: code exit in usermodel
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.name, req.user.email);
    res.status(200).send(`Deleted Successfully!`);
    return console.log(`Deleted Successfully!`);
  } catch (error) {
    const errorMsg = `Some Error Happened: ${error}`;
    res.status(500).send({ error: errorMsg });
    console.log(errorMsg);
  }
});

const upload = multer({
  // dest: "avatars", // dest: stands for distination and its value where the files are stored
  limits: {
    fileSize: 1000000, // used to set max file size we need to upload 1MegaByte = 1000000 = 1 milliom
  },
  fileFilter(req, file, cb) {
    // console.log(file.originalname);
    // console.log(file.mimetype);

    // Allowed ext
    const fileTypesRegx = /(jpeg|jpg|png)$/;
    // Check ext
    const extname = fileTypesRegx.test(file.originalname.toLowerCase());
    // Check mime
    const mimetype = fileTypesRegx.test(file.mimetype);

    console.log(extname, mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Error: Images Accepted (jpeg - jpg - png) Only!"));
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    if (!req.file) {
      throw new Error("no Image uploaded");
    }
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send({ accepted: true });
  },
  (err, req, res, next) => res.status(400).send({ error: err.message }) // method call only when error happned
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    if (!req.user.avatar) {
      throw new Error("No Avatar for this user!");
    }
    req.user.avatar = undefined;
    await req.user.save();
    res.send("Deleted Successfuly");
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get("/users/me/:id/avatar", async (req, res) => {
  const user = await User.findById(req.params.id);

  try {
    if (!user || !user.avatar) {
      throw new Error("Not Exist");
    }
    res.status(200).set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send({ error: err.message });
  }
});
module.exports = router;
