import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../config/api";

const CartContext = createContext(null);

const getCartKey = () => {
  try {
    const raw = localStorage.getItem("auth_user");
    if (raw) return `takipsilim_cart_${JSON.parse(raw).username}`;
  } catch {}
  return "takipsilim_cart_guest";
};

export const CartProvider = ({ children, onOrderPlaced }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem(getCartKey());
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(getCartKey(), JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // Load orders from the DB once on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        const dbOrders = res.data
          .filter((o) => o.status !== "CANCELLED")
          .map((o) => ({
          id: o.id,
          items: (o.lineItems || []).reduce((s, x) => s + x.quantity, 0),
          total: o.total,
          status: o.status,
          eta: "20:00 mins",
          createdAt: new Date(o.created_at).toLocaleString(),
          progressStep: 0,
          etaSeconds: 20 * 60,
          deliveryAddress: o.delivery_address,
          lineItems: (o.lineItems || []).map((li) => ({
            id: li.item_id,
            name: li.item_name,
            qty: li.quantity,
            price: parseFloat(li.price),
          })),
        }));
        setOrders(dbOrders);
      } catch {
        // server offline or not logged in — leave orders empty
      } finally {
        setOrdersLoaded(true);
      }
    };
    fetchOrders();
  }, []);

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

  const clearCart = () => {
    setCartItems([]);
    try { localStorage.removeItem(getCartKey()); } catch {}
  };

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
    setCartItems((prev) => {
      const updated = prev.filter((x) => !items.some((o) => o.id === x.id));
      try { localStorage.setItem(getCartKey(), JSON.stringify(updated)); } catch {}
      return updated;
    });
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

  const cancelOrder = async (orderId) => {
    try {
      await api.delete(`/orders/${orderId}`);
    } catch {}
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const value = {
    cartItems,
    cartTotal,
    addToCart,
    clearCart,
    removeFromCart,
    orders,
    ordersLoaded,
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