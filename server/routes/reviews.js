const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { itemId, rating, comment } = req.body;
  if (!itemId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "itemId and rating (1-5) are required" });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO reviews (user_id, item_id, rating, comment) VALUES (?, ?, ?, ?)",
      [req.user.id, itemId, rating, comment || null]
    );
    res.status(201).json({ id: result.insertId, itemId, rating, comment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/item/:itemId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at AS date,
              u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.item_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.itemId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/item/:itemId/rating", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT AVG(rating) AS avg, COUNT(*) AS count FROM reviews WHERE item_id = ?",
      [req.params.itemId]
    );
    res.json({ avg: parseFloat(rows[0].avg) || 0, count: parseInt(rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/my-reviews", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
