import { useMemo, useState } from "react";
import { useCart } from "../Context/useCart";
import { useToastContext } from "../Context/ToastContext";
import { useReviews } from "../Context/ReviewContext";
import { useAuth } from "../Context/useAuth";

const StarDisplay = ({ avg, count }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map((s) => (
      <span key={s} className={`text-sm ${s <= Math.round(avg) ? "text-yellow-500" : "text-gray-300"}`}>★</span>
    ))}
    <span className="text-[10px] opacity-60 ml-0.5">{avg > 0 ? `${avg.toFixed(1)} (${count})` : "No ratings"}</span>
  </div>
);

export const History = () => {
  const { orders = [], ordersLoaded, addToCart } = useCart();
  const { showToast } = useToastContext();
  const { addReview, getItemReviews, getItemAvgRating } = useReviews();
  const { user } = useAuth();

  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [itemRatings, setItemRatings] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [ratedOrders, setRatedOrders] = useState({});
  const [showReviewsFor, setShowReviewsFor] = useState(null);

  const deliveredOrders = useMemo(
    () => orders.filter((o) => (o.status || "").toUpperCase() === "DELIVERED"),
    [orders]
  );
  const orderCount = useMemo(() => deliveredOrders.length, [deliveredOrders]);

  const toggleItems = (orderId) =>
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));

  const openRateModal = (order) => {
    const init = {};
    (order.lineItems ?? []).forEach((item) => {
      init[item.id] = { rating: 0, comment: "" };
    });
    setItemRatings(init);
    setSelectedOrder(order);
    setShowRateModal(true);
  };

  const closeRateModal = () => {
    setShowRateModal(false);
    setSelectedOrder(null);
    setItemRatings({});
  };

  const setItemRating = (itemId, field, value) =>
    setItemRatings((prev) => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));

  const submitRating = () => {
    if (!selectedOrder) return;
    const lineItems = selectedOrder.lineItems ?? [];
    const hasAny = lineItems.some((item) => (itemRatings[item.id]?.rating ?? 0) > 0);
    if (!hasAny) {
      showToast("Please rate at least one item before submitting.", "warning");
      return;
    }
    lineItems.forEach((item) => {
      const r = itemRatings[item.id];
      if (r && r.rating > 0) {
        addReview(item.id, {
          username: user?.username ?? "Guest",
          rating: r.rating,
          comment: r.comment,
          date: new Date().toLocaleDateString(),
          itemName: item.name,
        });
      }
    });
    setRatedOrders((prev) => ({ ...prev, [selectedOrder.id]: true }));
    showToast("Thank you for your feedback!", "success");
    closeRateModal();
  };

  const handleOrderAgain = (order) => {
    (order.lineItems ?? []).forEach((item) => addToCart(item, item.qty));
    showToast("Items have been added back to your cart.", "success");
  };

  return (
    <div className="p-5 bg-[#efe4d4] rounded-xl border border-[#605146]/20 shadow-md text-[#3f3126]">
      <div className="relative mb-5 min-h-[52px]">
        <h2 className="absolute left-1/2 -translate-x-1/2 text-4xl font-bold text-[#605146] text-center whitespace-nowrap">
          Order History
        </h2>
        <div className="ml-auto w-fit bg-[#9a9a9a] text-black border border-[#605146]/40 rounded-sm px-3 py-2 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wide">Counts of Orders</p>
          <p className="text-lg font-black leading-5">{orderCount}x</p>
        </div>
      </div>

      <div className="rounded-[26px] border-2 border-[#605146]/50 p-4 bg-[#e9dccb]">
        <div className="max-h-[330px] overflow-y-auto pr-2 space-y-4">
          {!ordersLoaded ? (
            <div className="bg-white/70 border border-[#605146]/30 rounded-xl p-5 text-center">
              <p className="font-semibold opacity-60">Loading order history...</p>
            </div>
          ) : deliveredOrders.length === 0 ? (
            <div className="bg-white/70 border border-[#605146]/30 rounded-xl p-5 text-center">
              <p className="font-semibold">No order history yet.</p>
              <p className="text-sm opacity-70 mt-1">Completed orders will appear here once delivered.</p>
            </div>
          ) : (
            deliveredOrders.map((order) => {
              const expanded = expandedOrders[order.id];
              const lineItems = order.lineItems ?? [];
              return (
                <div key={order.id} className="bg-[#efefef] border border-[#605146]/40 rounded-xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-lg">{order.id}</p>
                        <p className="text-sm opacity-75">Items: {order.items}</p>
                        <p className="text-sm opacity-75">Total: ₱{order.total}</p>
                        <p className="text-sm opacity-75">{order.createdAt}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold text-white border bg-emerald-500 border-emerald-700">
                        DELIVERED
                      </span>
                    </div>

                    {lineItems.length > 0 && (
                      <div className="mt-3">
                        <button type="button" onClick={() => toggleItems(order.id)}
                          className="flex items-center gap-1 text-xs font-bold text-[#624d2d] hover:opacity-70 transition-opacity">
                          <span>{expanded ? "▾" : "▸"}</span>
                          {expanded ? "Hide" : "View"} ordered items
                        </button>
                        {expanded && (
                          <div className="mt-2 rounded-lg bg-white border border-[#605146]/20 divide-y divide-[#605146]/10">
                            {lineItems.map((item) => {
                              const avg = getItemAvgRating(item.id);
                              const count = getItemReviews(item.id).length;
                              return (
                                <div key={item.id} className="flex items-center gap-3 px-3 py-2">
                                  {item.image && (
                                    <img src={item.image} alt={item.name}
                                      className="w-9 h-9 rounded-lg object-cover shrink-0 border border-[#605146]/20" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-[#2f241c] capitalize truncate">{item.name}</p>
                                    <StarDisplay avg={avg} count={count} />
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <p className="text-xs font-black text-[#624d2d]">₱{item.price * item.qty}</p>
                                    <button type="button"
                                      onClick={() => setShowReviewsFor(showReviewsFor === item.id ? null : item.id)}
                                      className="text-[10px] text-[#605146] underline hover:opacity-70">
                                      {showReviewsFor === item.id ? "Hide" : "Reviews"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                            {showReviewsFor && lineItems.some(i => i.id === showReviewsFor) && (
                              <div className="px-3 py-3 bg-[#f9f5f0]">
                                <p className="text-xs font-black text-[#605146] mb-2 uppercase tracking-wide">Reviews</p>
                                {getItemReviews(showReviewsFor).length === 0 ? (
                                  <p className="text-xs opacity-50">No reviews yet.</p>
                                ) : (
                                  getItemReviews(showReviewsFor).map((r, i) => (
                                    <div key={i} className="mb-2 pb-2 border-b border-[#605146]/10 last:border-0">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#2f241c]">{r.username}</span>
                                        <span className="text-xs opacity-50">{r.date}</span>
                                      </div>
                                      <div className="flex gap-0.5 my-0.5">
                                        {[1,2,3,4,5].map(s => (
                                          <span key={s} className={`text-xs ${s <= r.rating ? "text-yellow-500" : "text-gray-300"}`}>★</span>
                                        ))}
                                      </div>
                                      {r.comment && <p className="text-xs opacity-70">{r.comment}</p>}
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                            <div className="flex justify-between px-3 py-2 bg-[#f0e3d2]/60">
                              <span className="text-xs font-bold">Total</span>
                              <span className="text-xs font-black text-[#624d2d]">₱{order.total}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {ratedOrders[order.id] ? (
                    <button type="button"
                      className="w-full py-2 bg-[#605146] hover:bg-[#4a3a22] text-white font-semibold text-sm border-t border-[#605146]/40 transition"
                      onClick={() => handleOrderAgain(order)}>
                      🔁 Order Again
                    </button>
                  ) : (
                    <button type="button"
                      className="w-full py-2 bg-[#f39b57] hover:bg-[#e8883e] text-[#2f241c] font-semibold text-sm border-t border-[#605146]/40 transition"
                      onClick={() => openRateModal(order)}>
                      Rate Items
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {showRateModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-[#f5f5f5] border-2 border-[#2f241c] rounded-2xl p-4 relative max-h-[85vh] overflow-y-auto">
            <button onClick={closeRateModal} className="absolute top-2 right-3 text-xl font-bold text-black">×</button>
            <h3 className="text-xl font-black mb-1">Rate Your Items</h3>
            <p className="text-xs opacity-60 mb-4">Rate each item from your order</p>

            <div className="space-y-4">
              {(selectedOrder.lineItems ?? []).map((item) => {
                const r = itemRatings[item.id] ?? { rating: 0, comment: "" };
                return (
                  <div key={item.id} className="bg-white rounded-xl p-3 border border-[#605146]/20">
                    <div className="flex items-center gap-2 mb-2">
                      {item.image && (
                        <img src={item.image} alt={item.name}
                          className="w-8 h-8 rounded-lg object-cover border border-[#605146]/20" />
                      )}
                      <p className="text-sm font-bold text-[#2f241c] capitalize">{item.name}</p>
                    </div>
                    <div className="flex gap-1.5 mb-2">
                      {[1,2,3,4,5].map((star) => (
                        <button key={star} type="button"
                          onClick={() => setItemRating(item.id, "rating", star)}
                          className={`text-2xl leading-none transition-transform active:scale-90 ${star <= r.rating ? "text-yellow-500" : "text-gray-300"}`}>
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea rows={2} value={r.comment}
                      onChange={(e) => setItemRating(item.id, "comment", e.target.value)}
                      placeholder="Leave a comment (optional)"
                      className="w-full border border-black/20 bg-[#f9f5f0] px-2 py-1.5 text-xs rounded-lg outline-none resize-none" />
                  </div>
                );
              })}
            </div>

            <button type="button" onClick={submitRating}
              className="w-full mt-4 py-2.5 bg-[#2f241c] text-white rounded-xl text-sm font-bold hover:opacity-90 transition">
              Submit Reviews
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
