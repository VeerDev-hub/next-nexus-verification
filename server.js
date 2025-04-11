// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { users } from "./data.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// __dirname workaround in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Route: Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route: User verification
app.get("/verify-user", (req, res) => {
  try {
    const reg = req.query.reg?.trim().toUpperCase();
    const email = req.query.email?.trim().toLowerCase();
    const password = req.query.password?.trim();

    console.log("🟡 Incoming:", { reg, email, password });

    // Log available users for debugging
    console.log("📘 Registered users:", users);

    // Input validation
    if (!reg || !email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all fields." });
    }

    // Find matching user
    const user = users.find(u =>
      u.reg === reg &&
      u.email === email &&
      u.password === password
    );

    if (!user) {
      console.warn("❌ No match found for:", { reg, email });
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    console.log("✅ User verified:", user.name);

    // Send success response
    return res.status(200).json({
      success: true,
      name: user.name,
      email: user.email,
      department: user.department,
      groupLink: user.groupLink,
    });

  } catch (err) {
    console.error("🔥 Error in /verify-user:", err.message);
    return res.status(500).json({ success: false, message: "Server error. Try again later." });
  }
});

// Catch-all route
app.all("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled Exception:", err.stack || err.message);
  res.status(500).json({ success: false, message: "Internal Server Error." });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
