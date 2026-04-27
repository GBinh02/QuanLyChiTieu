// backend/src/__tests__/health.test.js
// Đặt file này vào thư mục backend/src/__tests__/

// import request from "supertest";
// import app from "../app.js";
const request = require("supertest");
const app = require("../app");

describe("GET /api/health", () => {
  it("should return 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });
});

describe("GET /api/transactions", () => {
  it("should return 200 and an array", async () => {
    const res = await request(app).get("/api/transactions");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("POST /api/transactions", () => {
  it("should return 400 if body is invalid", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .send({}); // Thiếu amount, category, date
    expect(res.statusCode).toBe(400);
  });
});
