const request = require("supertest");
const app = require("../src/server");
const pool = require("../src/config/db");

afterAll(async () => {
  await pool.end();
});

describe("OpsDesk API", () => {
  describe("GET /", () => {
    it("returns API metadata", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/application\/json/);
      expect(response.body).toEqual({
        name: "OpsDesk API",
        message: "Support Operations and Ticket Management API",
        version: "1.0.0",
      });
    });
  });

  describe("GET /api/health", () => {
    it("reports that the API and database are healthy", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ok");
      expect(response.body.service).toBe("opsdesk-api");
      expect(response.body.database).toBe("connected");
      expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
    });
  });

  describe("GET /api/tickets", () => {
    it("returns tickets and pagination metadata", async () => {
      const response = await request(app).get("/api/tickets");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: expect.any(Number),
          totalPages: expect.any(Number),
        })
      );
    });
  });

  describe("GET /api/dashboard/metrics", () => {
    it("returns consistent ticket totals and breakdowns", async () => {
      const response = await request(app).get("/api/dashboard/metrics");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");

      const metrics = response.body.data;

      expect(metrics.total_tickets).toEqual(expect.any(Number));
      expect(metrics.active_tickets).toEqual(expect.any(Number));
      expect(metrics.resolved_tickets).toEqual(expect.any(Number));
      expect(metrics.closed_tickets).toEqual(expect.any(Number));

      expect(metrics.by_status).toEqual(
        expect.objectContaining({
          open: expect.any(Number),
          in_progress: expect.any(Number),
          resolved: expect.any(Number),
          closed: expect.any(Number),
        })
      );

      expect(metrics.by_priority).toEqual(
        expect.objectContaining({
          low: expect.any(Number),
          medium: expect.any(Number),
          high: expect.any(Number),
          urgent: expect.any(Number),
        })
      );

      const statusTotal = Object.values(metrics.by_status)
        .reduce((sum, count) => sum + count, 0);

      const priorityTotal = Object.values(metrics.by_priority)
        .reduce((sum, count) => sum + count, 0);

      expect(statusTotal).toBe(metrics.total_tickets);
      expect(priorityTotal).toBe(metrics.total_tickets);
      expect(metrics.active_tickets).toBe(
        metrics.by_status.open + metrics.by_status.in_progress
      );
    });
  });

  describe("Unknown routes", () => {
    it("returns a consistent 404 response", async () => {
      const response = await request(app).get("/api/does-not-exist");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Route not found",
        path: "/api/does-not-exist",
      });
    });
  });
});
