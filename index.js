// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const productRouter = require("./router/product.router");
const authRouter = require("./router/auth.router");
const cookies = require("cookie-parser");

app.use(cookies());
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests


mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("MongoDB connected");
}).catch((err) => {
  console.log(err);
});

app.use("/api/v1/product", productRouter);
app.use("/api/v1/auth", authRouter);

// Catch-all route for debugging

// Error handling middleware

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});