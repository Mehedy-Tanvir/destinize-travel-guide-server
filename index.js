const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const connectDB = require("./db/connectDB");
const User = require("./models/User");
const Tour = require("./models/Tour");
const Story = require("./models/Story");
const Review = require("./models/Review");
const Booking = require("./models/Booking");

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
      const myEmail = req?.query?.email;
      const query = { email: myEmail };
      const result = await User.findOne(query);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   tour guide route
  app.put("/users/:id", async (req, res) => {
    try {
      const user = req.body;
      const id = req.params.id;

      const result = await User.findByIdAndUpdate(id, user, { new: true });
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  // all user route
  app.get("/tourGuides", async (req, res) => {
    try {
      const query = { role: "Tour Guide" };
      const result = await User.find(query);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   all user route
  app.get("/tourGuides/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const result = await User.findById(id);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });

  //   admin route
  app.get("/allUsers", async (req, res) => {
    try {
      const result = await User.find();
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   admin route
  app.patch("/roles/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { role } = req.body;

      const result = await User.findByIdAndUpdate(id, { role }, { new: true });
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });

  // tour package related api
  // admin route
  app.post("/tours", async (req, res) => {
    try {
      const tour = req.body;
      const result = await Tour.create(tour);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   normal route
  app.get("/tours", async (req, res) => {
    try {
      const result = await Tour.find();
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   normal route
  app.get("/tours/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const result = await Tour.findById(id);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });

  //story related api
  app.post("/stories", async (req, res) => {
    try {
      const story = req.body;
      const result = await Story.create(story);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });

  //review related api
  // tourist route
  app.post("/reviews", async (req, res) => {
    try {
      const review = req.body;
      const result = await Review.create(review);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  // normal route
  app.get("/reviews/:tourGuideId", async (req, res) => {
    try {
      const tourGuideId = req.params.tourGuideId;
      const result = await Review.find({ tourGuideId: tourGuideId }).populate(
        "reviewerId",
        "name image"
      );
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   Booking related api
  // tourist route
  app.post("/bookings", async (req, res) => {
    try {
      const booking = req.body;
      const result = await Booking.create(booking);
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
