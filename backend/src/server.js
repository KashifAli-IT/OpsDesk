const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const pool = require("./config/db");
const ticketRoutes = require("./routes/ticketRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    name: "OpsDesk API",
    message: "Support Operations and Ticket Management API",
    version: "1.0.0",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      service: "opsdesk-api",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check database error:", error.message);

    res.status(503).json({
      status: "error",
      service: "opsdesk-api",
      database: "disconnected",
    });
  }
});

app.use("/api/tickets", ticketRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`OpsDesk API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
