const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const connectDB = require("./db/connectDB");

// middlewares
app.use(express.json());
app.use(cors());

const main = async () => {
  await connectDB();

  app.get("/", async (req, res) => {
    res.send("Welcome to Destinize server");
  });

  app.listen(port, () => {
    console.log(`Destinize Server is running on port ${port}`);
  });
};

main();
