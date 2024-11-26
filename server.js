const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const authRoutes = require("./routes/auth")
const postRoutes = require("./routes/post")
const commentRoutes = require("./routes/comment")

dotenv.config()

const app = express()
app.use(cors())
app.use(
  cors({
    origin: "http://localhost:3000", // ใส่ URL ของ Frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
)
app.use(express.json())

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.error("MongoDB connection error:", error))

app.use("/api", authRoutes)
app.use("/api", postRoutes)
app.use("/api", commentRoutes)

app.use("/uploads", express.static("uploads"))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
