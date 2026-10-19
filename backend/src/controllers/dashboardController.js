const { getDashboardMetrics } = require("../services/dashboardService");

async function getMetrics(req, res, next) {
  try {
    const data = await getDashboardMetrics();
    return res.status(200).json({ data });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMetrics,
};
