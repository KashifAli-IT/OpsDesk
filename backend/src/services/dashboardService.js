
const pool = require("../config/db");

async function getDashboardMetrics() {
  const [totalsResult, statusResult, priorityResult] =
    await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total_tickets,
          COUNT(*) FILTER (
            WHERE status IN ('open', 'in_progress')
          )::int AS active_tickets,
          COUNT(*) FILTER (
            WHERE status = 'resolved'
          )::int AS resolved_tickets,
          COUNT(*) FILTER (
            WHERE status = 'closed'
          )::int AS closed_tickets
        FROM tickets
      `),

      pool.query(`
        SELECT status, COUNT(*)::int AS count
        FROM tickets
        GROUP BY status
      `),

      pool.query(`
        SELECT priority, COUNT(*)::int AS count
        FROM tickets
        GROUP BY priority
      `),
    ]);

  const statusCounts = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };

  for (const row of statusResult.rows) {
    statusCounts[row.status] = row.count;
  }

  const priorityCounts = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  };

  for (const row of priorityResult.rows) {
    priorityCounts[row.priority] = row.count;
  }

  return {
    ...totalsResult.rows[0],
    by_status: statusCounts,
    by_priority: priorityCounts,
  };
}

module.exports = {
  getDashboardMetrics,
};
