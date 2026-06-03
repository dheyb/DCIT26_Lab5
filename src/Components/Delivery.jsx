import { useEffect, useRef, useState } from "react";
import { useCart } from "../Context/useCart";
import { useToastContext } from "../Context/ToastContext";

const progressLabels = [
  "Order Confirmed",
  "Preparing",
  "Out For Delivery",
  "Delivered",
];

const STEP_DURATIONS = [15, 20, 25, Infinity];

const STATUS_COLORS = [
  "bg-amber-500",
  "bg-blue-600",
  "bg-orange-500",
  "bg-emerald-600",
];

const RIDER_WELCOME =
  "Hi! I'm your rider for this order. Message me if you need help with delivery.";

const formatTime = (secs) => {
  if (secs <= 0) return "Arriving now";
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s} remaining`;
};

function useOrderTimer(orders, updateOrder) {
  const ref = useRef(null);

  useEffect(() => {
    if (orders.length === 0) return;

    ref.current = setInterval(() => {
      orders.forEach((order) => {
        const step = order.progressStep ?? 0;
        if (step >= progressLabels.length - 1) return; // already delivered

        const newEta = Math.max(0, (order.etaSeconds ?? 0) - 1);

        // Advance step when the step's allotted seconds have elapsed
        const elapsed = (order.etaSecondsStart ?? order.etaSeconds ?? 0) - newEta;
        const threshold = STEP_DURATIONS.slice(0, step + 1).reduce((a, b) => a + b, 0);
        const nextStep = elapsed >= threshold && step < progressLabels.length - 1
          ? step + 1
          : step;

        const statusMap = ["CONFIRMED", "PREPARING", "ON THE WAY", "DELIVERED"];

        updateOrder(order.id, {
          etaSeconds: newEta,
          progressStep: nextStep,
          status: statusMap[nextStep],
        });
      });
    }, 1000);

    return () => clearInterval(ref.current);
  }, [orders, updateOrder]);
}

export const Delivery = () => {
  const { orders = [], updateOrder, cancelOrder } = useCart();
  const { showToast } = useToastContext();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  // stamp etaSecondsStart on first render for each new order
  useEffect(() => {
    orders.forEach((order) => {
      if (order.etaSecondsStart == null) {
        updateOrder(order.id, { etaSecondsStart: order.etaSeconds ?? 20 * 60 });
      }
    });
  }, [orders.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useOrderTimer(orders, updateOrder);

  // Only show orders that are not yet delivered
  const activeOrders = orders.filter(
    (o) => (o.status || "").toUpperCase() !== "DELIVERED"
  );

  // keep selectedOrder in sync with live data
  const liveSelected = selectedOrder
    ? orders.find((o) => o.id === selectedOrder.id) ?? selectedOrder
    : null;

  const openTrack = (order) => {
    setSelectedOrder(order);
    setShowTrackModal(true);
    setShowChatModal(false);
  };

  const openChat = (order) => {
    setSelectedOrder(order);
    setShowTrackModal(false);
    setShowChatModal(true);
    setMessage("");
    setChatMessages([{ id: 1, from: "rider", text: RIDER_WELCOME }]);
  };

  const closeModals = () => {
    setShowTrackModal(false);
    setShowChatModal(false);
    setSelectedOrder(null);
    setMessage("");
    setChatMessages([]);
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text || !selectedOrder) return;
    setChatMessages((prev) => [...prev, { id: Date.now(), from: "user", text }]);
    setMessage("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "rider", text: "Got it! I'll update you soon." },
      ]);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCancel = (orderId) => {
    cancelOrder(orderId);
    showToast("Your order has been cancelled successfully.", "info");
  };

  return (
    <div className="p-5 bg-[#f0e3d2] rounded-xl border border-[#605146]/10 shadow-md text-[#605146]">
      <h3 className="text-4xl font-bold text-center text-[#605146] mb-6">Your Deliveries</h3>

      {activeOrders.length === 0 ? (
        <div className="bg-white/70 border border-[#605146]/30 rounded-2xl p-6 text-center">
          <p className="font-semibold">No active deliveries yet.</p>
          <p className="text-sm opacity-70 mt-1">
            Place an order from Menu then Check &amp; Pay.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((order) => {
            const step = order.progressStep ?? 0;
            const pct = ((step + 1) / progressLabels.length) * 100;

            return (
              <div
                key={order.id}
                className="bg-white/70 border border-[#605146]/30 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="font-bold text-lg">{order.id}</p>
                    <p className="text-sm opacity-80">Items: {order.items}</p>
                    <p className="text-sm opacity-80">Total: ₱{order.total}</p>
                    <p className="text-sm opacity-80">{order.createdAt}</p>
                    {order.deliveryAddress && (
                      <p className="text-sm opacity-80 flex items-start gap-1 mt-1">
                        <span className="shrink-0">📍</span>
                        <span>{order.deliveryAddress}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full text-white ${STATUS_COLORS[step]}`}>
                      {order.status}
                    </span>
                    {/* Live ETA countdown */}
                    <p className="mt-2 font-bold text-sm tabular-nums">
                      {step >= progressLabels.length - 1
                        ? "✅ Delivered"
                        : formatTime(order.etaSeconds ?? 0)}
                    </p>
                  </div>
                </div>

                {/* Mini progress bar on card */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] opacity-60 mb-1">
                    {progressLabels.map((l, i) => (
                      <span key={l} className={i <= step ? "font-bold text-[#605146]" : ""}>{l}</span>
                    ))}
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#605146]/15 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${STATUS_COLORS[step]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => openTrack(order)}
                    className="flex-1 py-2 rounded-md bg-[#605146] text-white hover:opacity-90 transition"
                  >
                    Track Order
                  </button>
                  <button
                    type="button"
                    onClick={() => openChat(order)}
                    className="flex-1 py-2 rounded-md bg-black text-white hover:opacity-90 transition"
                  >
                    Chat Rider
                  </button>
                  {step === 0 && (
                    <button
                      type="button"
                      onClick={() => handleCancel(order.id)}
                      className="flex-1 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Track Modal */}
      {showTrackModal && liveSelected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="w-full max-w-xl bg-white rounded-md border border-[#605146]/40 p-4">
            <h4 className="text-2xl font-semibold mb-1">Track Your Order</h4>
            <p className="text-xs opacity-60 mb-1">{liveSelected.id}</p>
            {liveSelected.deliveryAddress && (
              <p className="text-xs text-[#605146] mb-3 flex items-start gap-1">
                <span className="shrink-0">📍</span>
                <span>{liveSelected.deliveryAddress}</span>
              </p>
            )}

            {/* Step dots */}
            <div className="flex items-center mb-2">
              {progressLabels.map((label, i) => {
                const step = liveSelected.progressStep ?? 0;
                const done = i <= step;
                return (
                  <div key={label} className="flex-1 flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${done ? `${STATUS_COLORS[step]} border-transparent text-white` : "border-[#605146]/30 text-[#605146]/40"}`}>
                      {i < step ? "✓" : i + 1}
                    </div>
                    {i < progressLabels.length - 1 && (
                      <div className="sr-only" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Connector bar */}
            <div className="w-full h-3 rounded-full border border-[#605146]/40 overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${STATUS_COLORS[liveSelected.progressStep ?? 0]}`}
                style={{ width: `${(((liveSelected.progressStep ?? 0) + 1) / progressLabels.length) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-4 text-[10px] md:text-xs text-center mb-4">
              {progressLabels.map((label, i) => (
                <span key={label} className={i <= (liveSelected.progressStep ?? 0) ? "font-bold text-[#605146]" : "opacity-40"}>
                  {label}
                </span>
              ))}
            </div>

            {/* Status + live ETA */}
            <div className={`rounded-md text-white text-center py-2 mb-1 font-semibold transition-colors duration-500 ${STATUS_COLORS[liveSelected.progressStep ?? 0]}`}>
              {progressLabels[liveSelected.progressStep ?? 0]}
            </div>
            <p className="text-center text-sm font-bold tabular-nums mb-3">
              {(liveSelected.progressStep ?? 0) >= progressLabels.length - 1
                ? "✅ Your order has been delivered!"
                : formatTime(liveSelected.etaSeconds ?? 0)}
            </p>

            <button
              type="button"
              onClick={() => {
                setShowTrackModal(false);
                setShowChatModal(true);
                setChatMessages([{ id: 1, from: "rider", text: RIDER_WELCOME }]);
              }}
              className="w-full py-2 rounded-md bg-black text-white"
            >
              Chat with Rider
            </button>

            <button
              type="button"
              onClick={closeModals}
              className="w-full mt-2 py-2 rounded-md border border-[#605146]/40"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && liveSelected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="w-full max-w-xl bg-white rounded-xl border border-[#605146]/40 p-4 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-4xl font-bold text-[#605146]">Chat with Rider</h4>
              <p className="text-xs opacity-60 truncate max-w-[140px]">{liveSelected.id}</p>
            </div>

            <div className="flex-1 min-h-[200px] max-h-[280px] overflow-y-auto border border-[#605146]/20 rounded-lg bg-[#f5f5f5] p-3 mb-3 space-y-2">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.from === "user" ? "bg-[#2f241c] text-white" : "bg-white border border-[#605146]/25 text-[#605146]"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message your rider"
                className="flex-1 border border-[#605146]/30 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#605146]/15"
              />
              <button
                type="button"
                onClick={handleSend}
                className="px-5 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:opacity-90"
              >
                Send
              </button>
            </div>

            <button
              type="button"
              onClick={closeModals}
              className="w-full mt-3 py-2 rounded-lg border border-[#605146]/40 text-sm font-semibold hover:bg-[#f0e3d2]/50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
