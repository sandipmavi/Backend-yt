const express = require("express");
const Comment = require("../models/comment.model.js");
const Video = require("../models/video.model.js");
const router = express.Router();
const checkAuth = require("../middlewares/auth.middleware.js");
const mongoose = require("mongoose");

//create a comment
router.post("/", checkAuth, async (req, res) => {
  try {
    const { videoId, commentText } = req.body;

    if (!videoId || !commentText) {
      return res.status(400).json({
        message: "Please provide video ID and comment text",
      });
    }

    const newComment = new Comment({
      _id: new mongoose.Types.ObjectId(),
      video_id: videoId,
      commentText,
      user_id: req.user.id,
    });

    await newComment.save();
    await Video.findByIdAndUpdate(
      videoId,
      {
        $push: {
          comments: {
            _id: newComment._id,
          },
        },
      },
      { new: true, useFindAndModify: false }
    );
    res.status(201).json({
      message: "Comment created successfully",
    });
  } catch (error) {
    console.log("Error creating comment:", error.message);
    res.status(500).json({
      message: "Error creating comment",
    });
  }
});

//delete a comment
router.delete("/:commentId", checkAuth, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }
    if (comment.user_id.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to delete this comment",
      });
    }
    const videoId = comment.video_id;
    await Video.findByIdAndUpdate(
      videoId,
      {
        $pull: {
          comments: {
            _id: commentId,
          },
        },
      },
      { new: true, useFindAndModify: false }
    );
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting comment:", error.message);
    res.status(500).json({
      message: "Error deleting comment",
    });
  }
});
//get all comments
router.get("/all", async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "Comments fetched successfully",
      comments,
    });
  } catch (error) {
    console.log("Error fetching comments:", error.message);
    res.status(500).json({
      message: "Error fetching comments",
    });
  }
});

//edit the comment text
router.put("/update/:commentId", checkAuth, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const { newCommentText } = req.body;
    if (!newCommentText) {
      return (
        res,
        status(400).json({
          message: "Please provide new comment text",
        })
      );
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }
    if (comment.user_id.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to edit this comment",
      });
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { commentText: newCommentText },
      { new: true, useFindAndModify: false }
    );
    if (!updatedComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }
    res.status(200).json({
      message: "Comment updated successfully",
      updatedComment,
    });
  } catch (error) {
    console.log("Error updating comment:", error.message);
    res.status(500).json({
      message: "Error updating comment",
    });
  }
});
//get all comments of a video
router.get("/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    const comments = await Comment.find({ video_id: videoId })
      .populate("user_id", "channelName logoUrl") // Populate user details
      .sort({ createdAt: -1 }); // Sort by newest comments first

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get all comments of a video

module.exports = router;
