const express = require("express");
const app = express();

app.use(express.json());

// API 1: health
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// API 2: transactions (fake data)
app.get("/api/transactions", (req, res) => {
  res.status(200).json([]);
});

// API 3: validation POST
app.post("/api/transactions", (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "amount is required" });
  }

  res.status(201).json({ message: "created" });
});

module.exports = app;