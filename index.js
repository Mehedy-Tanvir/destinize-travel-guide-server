const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const connectDB = require("./db/connectDB");
const User = require("./models/User");

// middlewares
app.use(express.json());
app.use(cors());

const main = async () => {
  await connectDB();

  // user related apis

  app.post("/users", async (req, res) => {
    try {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await User.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await User.create(user);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  app.get("/users", async (req, res) => {
    try {
      const myEmail = req.query.email;
      const query = { email: myEmail };
      const result = await User.findOne(query);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });

  app.get("/", async (req, res) => {
    res.send("Welcome to Destinize server");
  });

  app.listen(port, () => {
    console.log(`Destinize Server is running on port ${port}`);
  });
};

main();
