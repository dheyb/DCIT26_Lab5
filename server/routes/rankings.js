const express = require("express");
const pool = require("../db");

const router = express.Router();

// Public endpoint — returns top customers ranked by delivered order count
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.username, u.name, COUNT(o.id) AS orders
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.status = 'DELIVERED'
       GROUP BY o.user_id, u.username, u.name
       ORDER BY orders DESC
       LIMIT 20`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
