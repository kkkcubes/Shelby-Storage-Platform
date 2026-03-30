const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

// 🔥 DB IMPORTS
const mongoose = require("mongoose");
const Video = require("./models/Video");
const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   🟢 MongoDB Connection
========================= */
mongoose
  .connect("mongodb://127.0.0.1:27017/videoDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB Error:", err));

/* =========================
   📁 Static Folder (IMPORTANT)
========================= */
app.use("/videos", express.static("uploads"));

/* =========================
   🔐 Auth Routes
========================= */
app.use("/auth", authRoutes);

/* =========================
   🎥 Multer Storage Config
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* =========================
   ⬆ Upload API
========================= */
app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    console.log("Uploading file...");

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const video = new Video({
      filename: req.file.filename,
      url: `http://localhost:5000/videos/${req.file.filename}`,
    });

    await video.save();

    console.log("✅ Saved to DB");

    res.json(video);
  } catch (err) {
    console.error("❌ UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   📺 Get Videos (FIXED)
========================= */
app.get("/videos-list", async (req, res) => {
  try {
    const videos = await Video.find();

    const formatted = videos.map((v) => ({
      videoUrl: v.url,
      name: v.filename,
      thumbnail: "https://via.placeholder.com/300x180?text=Video",
      tags: [],
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   🚀 Start Server
========================= */
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});