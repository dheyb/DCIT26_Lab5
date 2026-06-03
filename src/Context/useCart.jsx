import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children, onOrderPlaced }) => {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);

  const addToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((x) => x.id === product.id);
      if (existing) {
        return prev.map((x) =>
          x.id === product.id ? { ...x, qty: x.qty + qty } : x
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, x) => sum + x.price * x.qty, 0),
    [cartItems]
  );

  const placeOrder = (itemsToOrder = null) => {
    const items = itemsToOrder ?? cartItems;
    if (items.length === 0) return null;

    let deliveryAddress = "";
    try {
      const raw = localStorage.getItem("takipsilim_customer_profile");
      if (raw) deliveryAddress = JSON.parse(raw).address || "";
    } catch {}

    const newOrder = {
      id: `ORDER-${Date.now()}`,
      items: items.reduce((sum, x) => sum + x.qty, 0),
      total: items.reduce((sum, x) => sum + x.price * x.qty, 0),
      status: "PENDING",
      eta: "20:00 mins",
      createdAt: new Date().toLocaleString(),
      progressStep: 0,
      etaSeconds: 20 * 60,
      lineItems: items,
      deliveryAddress,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCartItems((prev) => prev.filter((x) => !items.some((o) => o.id === x.id)));
    if (onOrderPlaced) onOrderPlaced();
    return newOrder;
  };

  const updateOrder = (orderId, patch) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o))
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((x) => x.id !== productId));
  };

  const cancelOrder = (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const value = {
    cartItems,
    cartTotal,
    addToCart,
    clearCart,
    removeFromCart,
    orders,
    placeOrder,
    updateOrder,
    cancelOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};