import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { users } from "./data.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Handle __dirname in ES Module style
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Root route (serves index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route: Verify Password
app.get("/verify-user", (req, res) => {
  const reg = req.query.reg?.trim().toUpperCase();
  const email = req.query.email?.trim().toLowerCase();
  const password = req.query.password?.trim();

  if (!reg || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const expectedPassword = `${reg}@vitap.ac.in`;

  if (password !== expectedPassword) {
    return res.status(401).json({ success: false, message: "Incorrect password format" });
  }

  const user = users.find(u => u.reg === reg && u.email === email);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found or email mismatch" });
  }

  return res.json({
    success: true,
    name: user.name,
    email: user.email,
    department: user.department,
    groupLink: user.groupLink,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
