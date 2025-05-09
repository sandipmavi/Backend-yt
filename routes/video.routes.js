const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/user.model.js");
const Video = require("../models/video.model.js");
const cloudinary = require("../config/cloudinary.js");
const checkAuth = require("../middlewares/auth.middleware.js");

const router = express.Router();
//get user details
router.get("/", checkAuth, async (req, res) => {
  const user = req.user.id;
  res.status(200).json({
    message: "User authenticated",
    user,
  });
});
//upload video
router.post("/upload", checkAuth, async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    console.log("USER", req.user.id);
    if (!req.files || !req.files.videoUrl || !req.files.thumbnailUrl) {
      return res.status(400).json({
        message: "Please upload video and thumbnail",
      });
    }

    const uploadVideo = await cloudinary.uploader.upload(
      req.files.videoUrl.tempFilePath,
      {
        resource_type: "video",
        folder: "videos",
      }
    );
    console.log("UPLOAD VIDEO", uploadVideo);
    const uploadThumbnail = await cloudinary.uploader.upload(
      req.files.thumbnailUrl.tempFilePath,
      {
        folder: "thumbnails",
      }
    );
    console.log("UPLOAD THUMBNAIL", uploadThumbnail);

    const newVideo = new Video({
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      videoUrl: uploadVideo.secure_url,
      videoId: uploadVideo.public_id,
      user_id: req.user.id,
      thumbnailUrl: uploadThumbnail.secure_url,
      thumbnailId: uploadThumbnail.public_id,
      tags: tags ? tags.split(",") : [],
    });

    await newVideo.save();
    res.status(201).json({
      message: "Video uploaded successfully",
      video: newVideo,
    });
  } catch (error) {
    console.log("Error uploading video:", error.message);
    res.status(500).json({
      message: "Error uploading video",
    });
  }
});
//update video details
router.put("/update/:id", checkAuth, async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const videoId = req.params.id;
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }
    if (video.user_id.toString() != req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to update this video",
      });
    }
    if (req.files && req.files.thumbnailUrl) {
      await cloudinary.uploader.destroy(video.thumbnailId);
      const uploadThumbnail = await cloudinary.uploader.upload(
        req.files.thumbnailUrl.tempFilePath,
        {
          folder: "thumbnails",
        }
      );
      video.thumbnailUrl = uploadThumbnail.secure_url;
      video.thumbnailId = uploadThumbnail.public_id;
    }
    video.title = title || video.title;
    video.description = description || video.description;
    video.category = category || video.category;
    video.tags = tags ? tags.split(",") : video.tags;

    await video.save();
    res.status(200).json({
      message: "Video updated successfully",
      video,
    });
  } catch (error) {
    console.log("Error updating video:", error.message);
    res.status(500).json({
      message: "Error updating video",
    });
  }
});

//delete video by id
router.delete("/delete/:id", checkAuth, async (req, res) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }
    if (video.user_id.toString() != req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to delete this video",
      });
    }
    await cloudinary.uploader.destroy(video.videoId, {
      resource_type: "video",
    });
    await cloudinary.uploader.destroy(video.thumbnailId);
    await Video.findByIdAndDelete(videoId);
    res.status(200).json({
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting video:", error.message);
    res.status(500).json({
      message: "Error deleting video",
    });
  }
});
//get all videos
router.get("/all", async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "Videos fetched successfully",
      videos,
    });
  } catch (error) {
    console.log("Error fetching videos:", error.message);
    res.status(500).json({
      message: "Error fetching videos",
    });
  }
});
//get Own videos
router.get("/myvideos", checkAuth, async (req, res) => {
  try {
    console.log("USER ID", req.user.id);
    const videos = await Video.find({ user_id: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ videos, message: "Videos fetched successfully" });
  } catch (error) {
    console.log("Error fetching videos:", error.message);
    res.status(500).json({
      message: "Error fetching videos",
    });
  }
});

router.get("/:id", checkAuth, async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;

    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        $addToSet: { viewedBy: userId },
      },
      { new: true }
    );

    if (!video) return res.status(404).json({ error: "Video not found" });

    res.status(200).json({
      video,
      message: "Video fetched successfully",
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// 🔹 Get Videos by Category
router.get("/category/:category", async (req, res) => {
  try {
    const videos = await Video.find({ category: req.params.category }).sort({
      createdAt: -1,
    });
    res.status(200).json(videos);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// 🔹 Get Videos by Tags
router.get("/tags/:tag", async (req, res) => {
  try {
    const tag = req.params.tag;
    const videos = await Video.find({ tags: tag }).sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

//  Like Video
router.post("/like", checkAuth, async (req, res) => {
  try {
    const { videoId } = req.body;

    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { likedBy: req.user.id },
      $pull: { dislikedBy: req.user.id }, // Remove from dislikes if previously disliked
    });

    res.status(200).json({ message: "Liked the video" });
  } catch (error) {
    console.error("Like Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 🔹 UnLike Video
router.post("/dislike", checkAuth, async (req, res) => {
  try {
    const { videoId } = req.body;

    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { dislikes: req.user.id },
      $pull: { likes: req.user.id }, // Remove from likes if previously liked
    });

    res.status(200).json({ message: "Disliked the video" });
  } catch (error) {
    console.error("Dislike Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
