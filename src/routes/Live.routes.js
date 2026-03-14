// routes/health.js
import express from "express";
const liverouter = express.Router();

liverouter.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    time: new Date().toISOString()
  });
});

export default liverouter;
