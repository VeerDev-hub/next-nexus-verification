// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { users } from "./data.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin: "*", // You can restrict this later to your frontend domain
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Root Route - Serve HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Verify User Route
app.get("/verify-user", (req, res) => {
  try {
    const reg = req.query.reg?.trim().toUpperCase();
    const email = req.query.email?.trim().toLowerCase();
    const password = req.query.password?.trim();

    console.log("Incoming request:", { reg, email, password });

    if (!reg || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const expectedPassword = `${reg}@vitap.ac.in`;

    if (password !== expectedPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password format" });
    }

    const user = users.find((u) => u.reg === reg && u.email === email);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found or email mismatch" });
    }

    return res.status(200).json({
      success: true,
      name: user.name,
      email: user.email,
      department: user.department,
      groupLink: user.groupLink,
    });
  } catch (error) {
    console.error("Error in /verify-user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at → http://localhost:${PORT}`);
});
