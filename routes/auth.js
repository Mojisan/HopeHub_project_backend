const express = require("express")
const bcrypt = require("bcrypt")
const multer = require("multer")
const User = require("../models/User")
const router = express.Router()

// ตั้งค่า Multer สำหรับการอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/") // โฟลเดอร์สำหรับเก็บไฟล์
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname) // ตั้งชื่อไฟล์
  },
})
const upload = multer({ storage })

// API: ลงทะเบียน
router.post("/register", async (req, res) => {
  const { firstName, lastName, username, password } = req.body

  try {
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      firstName,
      lastName,
      username,
      password: hashedPassword,
    })

    await newUser.save()
    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
})

module.exports = router

// API: เข้าสู่ระบบ
router.post("/login", async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(400).json({ message: "User not found" })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" })
    }

    // ส่ง userId กลับไปที่ Frontend
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
})

// API: อัปเดตโปรไฟล์
router.put("/update-profile", upload.single("avatar"), async (req, res) => {
  const { userId, firstName, lastName, bio } = req.body

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // อัปเดตข้อมูล
    user.firstName = firstName || user.firstName
    user.lastName = lastName || user.lastName
    user.bio = bio || user.bio

    // เก็บ path ของไฟล์ avatar ถ้ามี
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`
    }

    await user.save()
    res.status(200).json({ message: "Profile updated successfully", user })
  } catch (error) {
    console.error("Error updating profile:", error)
    res.status(500).json({ message: "Failed to update profile", error })
  }
})

router.get("/get-profile", async (req, res) => {
  const userId = req.query.userId // ดึง userId จาก Query Parameters

  try {
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      bio: user.bio,
      profile: user.avatar || "",
      follower: user.follower || 0,
      following: user.following || 0,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
})

module.exports = router
