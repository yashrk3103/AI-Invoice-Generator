require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const aiRoutes = require('./routes/aiRoutes');
const emailRoutes = require("./routes/emailRoutes");

const app = express();

// CORS Configuration
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : null;

const allowedOrigins = [
  "https://vercel-front-ten.vercel.app",
  "http://localhost:5173",
  /https:\/\/vercel-front.*\.vercel\.app$/, // Allow Vercel preview URLs
  frontendUrl,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "API is running...",
    timestamp: new Date().toISOString(),
    env: {
      hasJWT: !!process.env.JWT_SECRET,
      hasMongo: !!process.env.MONGO_URI,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", emailRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.path });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

module.exports = app;