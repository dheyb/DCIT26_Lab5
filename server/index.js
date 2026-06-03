const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes    = require("./routes/auth");
const orderRoutes   = require("./routes/orders");
const reviewRoutes  = require("./routes/reviews");
const profileRoutes = require("./routes/profile");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth",    authRoutes);
app.use("/api/orders",  orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/profile", profileRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
