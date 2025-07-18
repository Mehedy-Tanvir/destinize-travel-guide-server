const express = require("express");
const app = express();
const { Resend } = require("resend");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const connectDB = require("./db/connectDB");
const User = require("./models/User");
const Tour = require("./models/Tour");
const Story = require("./models/Story");
const Review = require("./models/Review");
const Booking = require("./models/Booking");
const WishlistItem = require("./models/WishlistItem");
const Payment = require("./models/Payment");

// Resend
const resend = new Resend(`${process.env.RESEND_API}`);

// middlewares
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://destinize-tour-guide.web.app",
      "https://destinize-tour-guide.firebaseapp.com",
      "https://iridescent-croissant-12ff82.netlify.app",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

// my middlewares
// verify admin
const verifyAdmin = async (req, res, next) => {
  const email = req.user.email;
  const query = { email: email };
  const user = await User.findOne(query);
  const isAdmin = user?.role === "Admin";
  if (!isAdmin) {
    return res.status(403).send({ message: "forbidden access" });
  }
  next();
};
// verify tour guide
const verifyTourGuide = async (req, res, next) => {
  const email = req.user.email;
  const query = { email: email };
  const user = await User.findOne(query);
  const isTourGuide = user?.role === "Tour Guide";
  if (!isTourGuide) {
    return res.status(403).send({ message: "forbidden access" });
  }
  next();
};

// auth middlewares
const verifyToken = async (req, res, next) => {
  const token = req?.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const main = async () => {
  await connectDB();

  // auth related api
  app.post("/jwt", async (req, res) => {
    try {
      const user = req.body;
      const token = jwt.sign(
        {
          email: user.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10h" }
      );
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" ? true : false,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    } catch (error) {
      console.log(error);
    }
  });
  app.post("/logout", async (req, res) => {
    try {
      res
        .clearCookie("token", {
          maxAge: 0,
          secure: process.env.NODE_ENV === "production" ? true : false,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    } catch (error) {
      console.log(error);
    }
  });

  // send email
  app.post("/sendEmail", async (req, res) => {
    try {
      const emailDetails = req.body;
      const userTemplate = `
      <p>Dear Mehedy Tanvir,</p>
      <p>You have received a new message from a user:</p>
      <p><strong>Name:</strong> ${emailDetails.name}</p>
      <p><strong>Email:</strong> ${emailDetails.email}</p>
      <p><strong>Message:</strong></p>
      <p>${emailDetails.message}</p>
      <p>Please respond to the user's inquiry promptly.</p>
    `;

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "mehedytanvir451@gmail.com", // Replace with your email address
        subject: `New Message from ${emailDetails.name}`,
        html: userTemplate,
      });

      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

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
  app.put("/users/:id", verifyToken, verifyTourGuide, async (req, res) => {
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
  app.get("/allUsers", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const result = await User.find();
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   admin route
  app.patch("/roles/:id", verifyToken, verifyAdmin, async (req, res) => {
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
  app.post("/tours", verifyToken, verifyAdmin, async (req, res) => {
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
  app.get("/categoryTours", async (req, res) => {
    try {
      const category = req.query.category;
      const result = await Tour.find({ tourType: category });
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   normal route
  //   tourist route
  app.get("/tours/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const result = await Tour.findById(id);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });

  //story related api
  //   tourist route
  app.post("/stories", verifyToken, async (req, res) => {
    try {
      const story = req.body;
      const result = await Story.create(story);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   normal route
  app.get("/stories", async (req, res) => {
    try {
      const result = await Story.find();
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   normal route
  app.get("/stories/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const result = await Story.findById(id);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });

  //review related api
  // tourist route
  app.post("/reviews", verifyToken, async (req, res) => {
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
  app.post("/bookings", verifyToken, async (req, res) => {
    try {
      const booking = req.body;
      const touristId = req.body.tourist;
      const result = await Booking.create(booking);
      const bookingCount = await Booking.countDocuments({
        tourist: touristId,
      });
      if (bookingCount === 3) {
        const discount = await User.findByIdAndUpdate(
          { _id: touristId },
          { discount: true },
          { new: true }
        );
        res.send({ result, discount });
      } else {
        res.send(result);
      }
    } catch (error) {
      console.log(error);
    }
  });
  //   tourist route
  app.patch("/bookingDiscount/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const { price, tourist } = req.body;
      const discount = await Booking.findByIdAndUpdate(
        id,
        { discountedPrice: price },
        { new: true }
      );
      const discountClose = await User.findByIdAndUpdate(
        tourist,
        { discount: false },
        { new: true }
      );
      res.send({ message: "Discount Applied", discount, discountClose });
    } catch (error) {
      console.log(error);
    }
  });
  //   tourist route
  app.get("/bookings/:id", verifyToken, async (req, res) => {
    try {
      const touristId = req.params.id;
      const result = await Booking.find({ tourist: touristId })
        .populate("tourGuide")
        .populate("tourPackage");
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   tourist route
  app.get("/myBookings/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const result = await Booking.findById(id)
        .populate("tourGuide")
        .populate("tourPackage");
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   tourist route
  app.delete("/bookings/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const result = await Booking.findByIdAndDelete(id);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   tour guide route
  app.get(
    "/assignedTours/:id",
    verifyToken,
    verifyTourGuide,
    async (req, res) => {
      try {
        const tourGuideId = req.params.id;
        const result = await Booking.find({ tourGuide: tourGuideId })
          .populate("tourist")
          .populate("tourPackage");
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    }
  );
  //   tour guide route
  app.patch(
    "/updateTourStatus/:id",
    verifyToken,
    verifyTourGuide,
    async (req, res) => {
      try {
        const id = req.params.id;
        const { status } = req.body;
        const result = await Booking.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        );
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    }
  );

  //   tourist route
  app.post("/wishlistItems", verifyToken, async (req, res) => {
    try {
      const wishlistItem = req.body;
      const result = await WishlistItem.create(wishlistItem);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   tourist route
  app.get("/wishlistItems/:id", verifyToken, async (req, res) => {
    try {
      const touristId = req.params.id;
      const result = await WishlistItem.find({ tourist: touristId }).populate(
        "tourPackage"
      );
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });
  //   tourist route
  app.delete("/wishlistItems/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const result = await WishlistItem.findByIdAndDelete(id);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });

  //   payment related routes

  // payment intent
  app.post("/create-payment-intent", verifyToken, async (req, res) => {
    const { price } = req.body;
    const amount = parseInt(price * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  });
  app.post("/payment", async (req, res) => {
    try {
      const payment = req.body;
      const result = await Payment.create(payment);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });

  //   tourist route
  app.patch("/bookingConfirm/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const { status } = req.body;
      const result = await Booking.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
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
