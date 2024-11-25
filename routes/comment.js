const express = require("express");
const Comment = require("../models/Comment");

const router = express.Router();

// API: Like Comment
router.put("/:commentId/like", async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.like += 1;
    await comment.save();
    res.status(200).json({ message: "Comment liked", comment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
