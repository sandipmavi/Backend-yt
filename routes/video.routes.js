const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/user.model.js");
const Video = require("../models/video.model.js");
const cloudinary = require("../config/cloudinary.config.js");

const router = express.Router();

router.post("/upload", async (req, res) => {
    
 })


module.exports = router;
