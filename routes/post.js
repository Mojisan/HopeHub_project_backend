const express = require("express")
const Post = require("../models/Post")
const Comment = require("../models/Comment")
const User = require("../models/User")

const router = express.Router()

// API: Create Post
router.get("/posts", async (req, res) => {
  try {
    // Fetch all posts
    const posts = await Post.find()

    // Map through the posts and fetch user & comments data for each
    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        // Fetch the user who created the post
        const user = await User.findById(post.userId)

        // Build the postBy object
        const postBy = user
          ? {
              userId: user._id.toString(),
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              avatar: user.avatar || null,
            }
          : null

        // Simulate comments (you'll need to adjust based on your comment model)
        const comments = post.comments.map((comment) => ({
          commentBy: {
            commentId: comment._id.toString(),
            userId: comment.userId.toString(),
            username: comment.username, // Replace with actual username
            firstName: comment.firstName, // Replace with actual firstName
            lastName: comment.lastName, // Replace with actual lastName
            avatar: comment.avatar || null, // Replace with actual avatar
          },
          commentMessage: comment.message,
          like: comment.like || 0,
          dislike: comment.dislike || 0,
        }))
        return {
          postId: post._id.toString(),
          postBy,
          title: post.title,
          content: post.content,
          postAt: post.postAt
            ? new Date(post.postAt).toLocaleDateString("en-GB") // Format date to DD-MM-YYYY
            : null,
          like: post.like || 0,
          dislike: post.dislike || 0,
          comment: comments,
        }
      })
    )

    // Send the response
    res.status(200).json(formattedPosts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    res.status(500).json({ message: "Server error", error })
  }
})

router.get("/post/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Fetch the post by ID
    const post = await Post.findById(id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Fetch the user who created the post
    let user = null
    try {
      user = await User.findById(post.userId)
    } catch (error) {
      console.error("Error fetching user:", error)
    }

    const postBy = user
      ? {
          userId: user._id.toString(),
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar || null,
        }
      : null

    // Safely handle comments
    const comments = Array.isArray(post.comments)
      ? post.comments.map((comment) => ({
          commentBy: {
            commentId: comment._id.toString(),
            userId: comment.userId.toString(),
            username: comment.username,
            firstName: comment.firstName,
            lastName: comment.lastName,
            avatar: comment.avatar || null,
          },
          commentMessage: comment.message,
          like: comment.like || 0,
          dislike: comment.dislike || 0,
        }))
      : []

    const response = {
      postId: post._id.toString(),
      postBy,
      title: post.title,
      content: post.content,
      postAt: post.postAt
        ? new Date(post.postAt).toLocaleDateString("en-GB")
        : null,
      like: post.like || 0,
      dislike: post.dislike || 0,
      comment: comments,
    }

    res.status(200).json(response)
  } catch (error) {
    console.error("Error fetching post:", error)
    res.status(500).json({ message: "Server error", error })
  }
})

router.post("/addPost", async (req, res) => {
  const { userId, title, content } = req.body

  try {
    const newPost = new Post({
      userId,
      title,
      content,
    })

    const savedPost = await newPost.save()

    res
      .status(201)
      .json({ message: "Post created successfully", post: savedPost })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
})

// API: Like Post
router.put("/:postId/like", async (req, res) => {
  const { postId } = req.params

  try {
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    post.like += 1
    await post.save()
    res.status(200).json({ message: "Post liked", post })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
})

// API: Add Comment to Post
router.post("/:postId/comment", async (req, res) => {
  const { postId } = req.params
  const { userId, comment } = req.body

  try {
    const newComment = new Comment({
      userId,
      postId,
      comment,
    })

    const savedComment = await newComment.save()

    // Add comment ID to the post
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    post.comments.push(savedComment._id)
    await post.save()

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: savedComment })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
})

module.exports = router
