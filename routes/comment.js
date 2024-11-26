const express = require("express")
const Comment = require("../models/Comment")

const router = express.Router()

// API: Like Comment
router.post("/comment", async (req, res) => {
  const { userId, postId, comment } = req.body

  try {
    // สร้าง Comment ใหม่
    const newComment = new Comment({ userId, postId, comment })
    const savedComment = await newComment.save()

    // อัปเดต Post ด้วยการเพิ่ม Comment ID
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    post.comments.push(savedComment._id) // เพิ่ม ObjectId ของ Comment
    await post.save()

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: savedComment })
  } catch (error) {
    console.error("Error adding comment:", error)
    res.status(500).json({ message: "Server error", error })
  }
})

router.get("/comments", async (req, res) => {
  const { postId } = req.query

  try {
    if (!postId) {
      return res.status(400).json({ message: "postId is required" })
    }

    // ดึงความคิดเห็นที่เกี่ยวข้องกับ postId และ populate ข้อมูลผู้ใช้
    const comments = await Comment.find({ postId })
      .populate("userId", "userId username firstName lastName avatar") // ระบุฟิลด์ที่ต้องการจาก IUser
      .exec()

    // ส่งข้อมูลกลับในโครงสร้างที่เหมาะสม
    const formattedComments = comments.map((comment) => ({
      commentBy: {
        userId: comment.userId._id,
        username: comment.userId.username,
        firstName: comment.userId.firstName,
        lastName: comment.userId.lastName,
        avatar: comment.userId.avatar,
      },
      commentMessage: comment.comment,
      like: comment.like,
      dislike: comment.dislike,
    }))

    res.status(200).json({
      message: "Comments fetched successfully",
      comments: formattedComments,
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    res.status(500).json({ message: "Failed to fetch comments", error })
  }
})

router.put("comment/:commentId/like", async (req, res) => {
  const { commentId } = req.params

  try {
    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (comment.dislike > 0) {
      comment.dislike -= 1
    }
    comment.like += 1
    await comment.save()
    res.status(200).json({ message: "Comment liked", comment })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
})

router.put("comment/:commentId/dislike", async (req, res) => {
  const { commentId } = req.params

  try {
    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (comment.like > 0) {
      comment.like -= 1
    }
    comment.dislike += 1
    await comment.save()
    res.status(200).json({ message: "Comment liked", comment })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
})

module.exports = router
