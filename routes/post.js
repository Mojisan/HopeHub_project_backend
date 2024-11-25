const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const router = express.Router();

// API: Create Post
router.post("/", async (req, res) => {
  const { userId, title, content } = req.body;

  try {
    const newPost = new Post({
      userId,
      title,
      content,
    });

    const savedPost = await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: savedPost });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// API: Like Post
router.put("/:postId/like", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.like += 1;
    await post.save();
    res.status(200).json({ message: "Post liked", post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// API: Add Comment to Post
router.post("/:postId/comment", async (req, res) => {
  const { postId } = req.params;
  const { userId, comment } = req.body;

  try {
    const newComment = new Comment({
      userId,
      postId,
      comment,
    });

    const savedComment = await newComment.save();

    // Add comment ID to the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push(savedComment._id);
    await post.save();

    res.status(201).json({ message: "Comment added successfully", comment: savedComment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
