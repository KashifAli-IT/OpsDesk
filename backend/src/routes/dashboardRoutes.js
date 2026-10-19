const express = require("express");
const { getMetrics } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/metrics", getMetrics);

module.exports = router;
