const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
// Import routes
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customer");
const staffRoutes = require("./routes/staff");
const adminRoutes = require("./routes/admin");

// Import cron jobs
require("./cron");

const app = express();

// ─── Middleware ───
app.use(cors()); // allows React to talk to Express
app.use(express.json()); // parses incoming JSON requests

// ─── Routes ───
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/admin", adminRoutes);

// ─── Health check ───
app.get("/", (req, res) => {
  res.json({ message: "RaktaData API is running!" });
});

// ─── Global error handler ───
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// ─── Start server ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
