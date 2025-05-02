const express = require("express");
const cloudinary = require("../config/cloudinary.js");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    console.log("Request coming");
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log("Hashed Password", hashedPassword);
    const uploadImage = await cloudinary.uploader.upload(
      req.files.logoUrl.tempFilePath
    );
    console.log("UPLOAD IMAGE", uploadImage);

    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      channelName: req.body.channelName,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      logoUrl: uploadImage.secure_url,
      logoId: uploadImage.public_id,
    });
    const user = await newUser.save();
    res.status(201).json({
      user,
      message: "User created successfully",
    });
  } catch (error) {
    console.log("Error creating user:", error.message);
    res.status(500).json({
      message: "Error creating user",
    });
  }
});
router.post("/login", async (req, res) => {
  try {
    const existingUser = await User.findOne({
      email: req.body.email,
    });
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const isValid = await bcrypt.compare(
      req.body.password,
      existingUser.password
    );
    if (!isValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        phone: existingUser.phone,
        channelName: existingUser.channelName,
        logoId: existingUser.logoId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );
    res.status(200).json({
      user: existingUser,
      token: token,
      message: "Login successful",
    });
  } catch (error) {
    console.log("Error logging in:", error.message);
    res.status(500).json({
      message: "Error logging in",
    });
  }
});

module.exports = router;
