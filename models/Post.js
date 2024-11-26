const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  like: { type: Number, default: 0 },
  dislike: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // อ้างอิง Comment
  postAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Post", postSchema)
