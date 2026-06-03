const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT full_name, email, phone, address, bio FROM profiles WHERE user_id = ?",
      [req.user.id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/", async (req, res) => {
  const { fullName, email, phone, address, bio } = req.body;
  try {
    await pool.query(
      `INSERT INTO profiles (user_id, full_name, email, phone, address, bio)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         email     = VALUES(email),
         phone     = VALUES(phone),
         address   = VALUES(address),
         bio       = VALUES(bio)`,
      [req.user.id, fullName || null, email || null, phone || null, address || null, bio || null]
    );
    res.json({ message: "Profile saved" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
