const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.post("/", async (req, res) => {
  const { items, total, paymentMethod, deliveryAddress } = req.body;
  if (!items || !total || !paymentMethod || !deliveryAddress) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const orderId = `ORDER-${Date.now()}`;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      "INSERT INTO orders (id, user_id, total, payment_method, delivery_address, status) VALUES (?, ?, ?, ?, ?, 'PENDING')",
      [orderId, req.user.id, total, paymentMethod, deliveryAddress]
    );
    for (const item of items) {
      await conn.query(
        "INSERT INTO order_items (order_id, item_id, item_name, quantity, price) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.id, item.name, item.qty, item.price]
      );
    }
    await conn.commit();
    res.status(201).json({ id: orderId, status: "PENDING", total, deliveryAddress });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    conn.release();
  }
});

router.get("/", async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    for (const order of orders) {
      const [items] = await pool.query(
        "SELECT * FROM order_items WHERE order_id = ?",
        [order.id]
      );
      order.lineItems = items;
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Order not found" });
    const order = rows[0];
    const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
    order.lineItems = items;
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["PENDING", "CONFIRMED", "PREPARING", "ON THE WAY", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    await pool.query("UPDATE orders SET status = ? WHERE id = ? AND user_id = ?", [
      status, req.params.id, req.user.id,
    ]);
    res.json({ message: "Status updated", status });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT status FROM orders WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Order not found" });
    if (rows[0].status !== "PENDING" && rows[0].status !== "CONFIRMED") {
      return res.status(400).json({ message: "Order cannot be cancelled at this stage" });
    }
    await pool.query("UPDATE orders SET status = 'CANCELLED' WHERE id = ?", [req.params.id]);
    res.json({ message: "Order cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
