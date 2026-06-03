import { useState } from "react";
import { useCart } from "../Context/useCart";
import { useToastContext } from "../Context/ToastContext";
import { usePrefs } from "../Context/PrefsContext";
import api from "../config/api";

export const CheckAndPay = ({ setActiveLink }) => {
  const { cartItems, cartTotal, placeOrder, removeFromCart } = useCart();
  const { showToast } = useToastContext();
  const { prefs } = usePrefs();
  const dm = prefs.darkMode;
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [checkedItems, setCheckedItems] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddressAlert, setShowAddressAlert] = useState(false);

  const toggleItem = (id) => setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  const allChecked = cartItems.length > 0 && cartItems.every((item) => checkedItems[item.id]);

  const toggleAll = () => {
    if (allChecked) {
      setCheckedItems({});
    } else {
      const all = {};
      cartItems.forEach((item) => { all[item.id] = true; });
      setCheckedItems(all);
    }
  };

  const selectedItems = cartItems.filter((item) => checkedItems[item.id]);
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      showToast("Please check at least one item to proceed to checkout.", "warning");
      return;
    }
    try {
      const res = await api.get("/profile");
      const address = res.data?.address || "";
      if (!address.trim()) { setShowAddressAlert(true); return; }
    } catch {
      setShowAddressAlert(true);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmOrder = async () => {
    try {
      const profileRes = await api.get("/profile");
      const deliveryAddress = profileRes.data?.address || "";
      await api.post("/orders", {
        items: selectedItems.map(item => ({ id: item.id, name: item.name, qty: item.qty, price: parseFloat(item.price) })),
        total: selectedTotal,
        paymentMethod,
        deliveryAddress,
      });
      const order = placeOrder(selectedItems);
      if (order) {
        setCheckedItems((prev) => {
          const next = { ...prev };
          selectedItems.forEach((item) => delete next[item.id]);
          return next;
        });
        setShowConfirm(false);
        showToast(`Order placed! Payment: ${paymentMethod === "online" ? "Online (e-wallet)" : "Cash on Delivery"}.`, "success");
      }
    } catch {
      showToast("Failed to place order. Please try again.", "error");
    }
  };

  const card = dm ? "bg-[#2e2318] border-[#c8a882]/20" : "bg-white border-black/50";
  const cancelBtn = dm
    ? "border-[#c8a882]/30 text-[#f0e3d2] hover:bg-[#3a2c20]"
    : "border-[#605146]/30 hover:bg-gray-50";

  return (
    <div className={`p-5 rounded-xl border shadow-md ${dm ? "bg-[#241c15] border-[#c8a882]/20 text-[#f0e3d2]" : "bg-[#efe4d4] border-[#605146]/20 text-[#2f241c]"}`}>
      <div className={`rounded-[26px] border-2 p-4 md:p-6 max-w-2xl mx-auto space-y-4 ${dm ? "border-[#c8a882]/30 bg-[#1e1710]" : "border-[#605146]/60 bg-[#e9dccb]"}`}>

        {/* Order Summary */}
        <div className={`border rounded-xl p-4 ${card}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-black">Order Summary</h3>
            {cartItems.length > 0 && (
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4 accent-[#624d2d] cursor-pointer" />
                Select All
              </label>
            )}
          </div>
          {cartItems.length === 0 ? (
            <p className="text-sm opacity-70">Your cart is empty.</p>
          ) : (
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className={`flex items-center gap-3 px-2 py-2 rounded-lg transition ${checkedItems[item.id] ? "bg-[#f5d76e]/25" : dm ? "hover:bg-[#3a2c20]" : "hover:bg-gray-50"}`}>
                  <input type="checkbox" checked={!!checkedItems[item.id]} onChange={() => toggleItem(item.id)} className="w-4 h-4 accent-[#624d2d] cursor-pointer shrink-0" />
                  <span className="flex-1 text-sm font-semibold">{item.qty}x {item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">₱{item.price * item.qty}</span>
                    <button type="button" onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition text-lg leading-none" title="Remove item">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className={`border rounded-xl px-4 py-3 flex justify-between items-center font-black ${card}`}>
          <span>Total{selectedItems.length > 0 && selectedItems.length < cartItems.length ? ` (${selectedItems.length} selected)` : ""}:</span>
          <span>₱{selectedItems.length > 0 ? selectedTotal : cartTotal}</span>
        </div>

        {/* Payment Method */}
        <div className={`border rounded-xl p-4 ${card}`}>
          <h3 className="text-lg font-black mb-3">Payment Method</h3>
          <div className="space-y-3">
            {[
              { key: "online", icon: "💳", label: "Online Payment", sub: "Pay using e-wallet" },
              { key: "cod",    icon: "💵", label: "Cash on Delivery", sub: "Pay when your order arrives" },
            ].map(({ key, icon, label, sub }) => (
              <button key={key} type="button" onClick={() => setPaymentMethod(key)}
                className={`w-full text-left border rounded-xl p-4 transition ${
                  paymentMethod === key
                    ? "bg-[#f5d76e] border-[#e0c33e] text-[#2f241c]"
                    : dm ? "border-[#c8a882]/20 bg-[#3a2c20] hover:bg-[#4a3a28]" : "border-black/40 bg-white hover:bg-[#f5f0e8]"
                }`}>
                <p className="font-black text-sm">{icon} {label}</p>
                <p className="text-xs opacity-75 mt-1">{sub}</p>
              </button>
            ))}
          </div>
        </div>

        <button type="button" onClick={handleCheckout} disabled={selectedItems.length === 0}
          className="w-full py-3 rounded-xl bg-[#2f241c] text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition">
          Checkout{selectedItems.length > 0 ? ` (${selectedItems.length} item${selectedItems.length > 1 ? "s" : ""})` : ""}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-sm p-6 ${dm ? "bg-[#241c15] text-[#f0e3d2]" : "bg-white text-[#2f241c]"}`}>
            <h3 className="text-xl font-black mb-1 text-center">Confirm Order</h3>
            <p className="text-xs text-center opacity-60 mb-4">Please review your order before confirming</p>
            <div className={`rounded-xl p-3 mb-3 space-y-1.5 max-h-40 overflow-y-auto ${dm ? "bg-[#2e2318]" : "bg-[#f5f0e8]"}`}>
              {selectedItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm font-semibold">
                  <span>{item.qty}x {item.name}</span>
                  <span>₱{item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-black text-sm px-1 mb-1">
              <span>Total</span><span>₱{selectedTotal}</span>
            </div>
            <p className="text-xs text-center opacity-60 mb-5">Payment: {paymentMethod === "online" ? "Online (e-wallet)" : "Cash on Delivery"}</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowConfirm(false)} className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition ${cancelBtn}`}>Cancel</button>
              <button type="button" onClick={handleConfirmOrder} className="flex-1 py-2.5 rounded-xl bg-[#2f241c] text-white font-bold text-sm hover:opacity-90 transition">Confirm Order</button>
            </div>
          </div>
        </div>
      )}

      {/* No Address Alert */}
      {showAddressAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center ${dm ? "bg-[#241c15] text-[#f0e3d2]" : "bg-white text-[#2f241c]"}`}>
            <div className="text-4xl mb-3">📍</div>
            <h3 className="text-lg font-black mb-2">No Delivery Address</h3>
            <p className="text-sm opacity-70 mb-5">Please set your delivery address in Settings before placing an order.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAddressAlert(false)} className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition ${cancelBtn}`}>Cancel</button>
              <button type="button" onClick={() => { setShowAddressAlert(false); setActiveLink("Setting"); }} className="flex-1 py-2.5 rounded-xl bg-[#624d2d] text-white font-bold text-sm hover:opacity-90 transition">Go to Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
