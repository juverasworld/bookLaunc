const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const Post = require("./models/Post");
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_jwt_secret_key",
    (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    }
  );
};

// MongoDB Atlas connection
require("dotenv").config();
const mongoURI =
  process.env.MONGODB_URI ||
  "mongodb+srv://blogUser:SecureP%40ssw0rd123@blogcluster.mongodb.net/blogDB?retryWrites=true&w=majority";
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Hardcoded admin user
const ADMIN_EMAIL = "admin@blog.com";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("admin123", 10);

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/post/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "post.html"));
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (
    email !== ADMIN_EMAIL ||
    !bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)
  ) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { email, role: "admin" },
    process.env.JWT_SECRET || "your_jwt_secret_key",
    { expiresIn: "1h" }
  );
  res.json({ token });
});

app.get("/api/posts", async (req, res) => {
  try {
    let posts = await Post.find().sort({ createdAt: -1 });
    posts = posts.map((post) => ({
      ...post._doc,
      image: post.image || `https://picsum.photos/seed/${post._id}/300/200`,
    }));
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({
      ...post._doc,
      image: post.image || `https://picsum.photos/seed/${post._id}/300/200`,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post(
  "/api/posts",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden: Admin access required" });
    }

    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    try {
      const sanitizedContent = sanitizeHtml(content, {
        allowedTags: [
          "p",
          "strong",
          "em",
          "a",
          "ul",
          "ol",
          "li",
          "h1",
          "h2",
          "h3",
          "blockquote",
        ],
        allowedAttributes: { a: ["href", "target"] },
      });
      const newPost = new Post({
        title,
        content: sanitizedContent,
        image: req.file ? `/uploads/${req.file.filename}` : null,
      });
      await newPost.save();
      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error adding post:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Catch-all route for 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
