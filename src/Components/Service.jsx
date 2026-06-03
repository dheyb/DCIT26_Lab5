import { useEffect, useRef, useState } from "react";
import { useAuth } from "../Context/useAuth";
import { usePrefs } from "../Context/PrefsContext";

const CREW_WELCOME = "👋 Welcome to Takipsilim Café support! How can we help you today?";

const FAQ = [
  {
    q: "What are your operating hours?",
    a: "We're open Monday–Friday 8:00 AM – 9:00 PM and Saturday–Sunday 9:00 AM – 10:00 PM.",
  },
  {
    q: "How do I track my order?",
    a: "Go to the Delivery page and click 'Track Order' on your active order to see real-time progress.",
  },
  {
    q: "Can I cancel my order?",
    a: "Yes! You can cancel while the order is still in 'Order Confirmed' status from the Delivery page.",
  },
  {
    q: "How do I save my favorite drinks?",
    a: "Tap the ♥ button on any menu item to save it to your Saved Sips for quick reordering.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Online Payment (e-wallet) and Cash on Delivery.",
  },
];

const QUICK_REPLIES = [
  "What are your hours?",
  "Where is the café?",
  "How do I place an order?",
  "I have an issue with my order.",
];

const AUTO_REPLIES = {
  "what are your hours?": "We're open Mon–Fri 8AM–9PM and Sat–Sun 9AM–10PM. ☕",
  "where is the café?": "We're at 123 Cafe Street, Tanza, Cavite. 📍",
  "how do i place an order?": "Go to Menu, pick your items, add to cart, then head to Check & Pay to checkout!",
  "i have an issue with my order.": "We're sorry to hear that! Please describe your issue and our crew will assist you shortly. 🙏",
};

const getAutoReply = (text) => {
  const key = text.toLowerCase().trim();
  return AUTO_REPLIES[key] ?? "Thanks for reaching out! Our crew will respond shortly. ☕";
};

export const Service = () => {
  const { user } = useAuth();
  const { prefs } = usePrefs();
  const dm = prefs.darkMode;
  const [messages, setMessages] = useState([
    { id: 1, from: "crew", text: CREW_WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text: trimmed }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "crew", text: getAutoReply(trimmed) },
      ]);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className={`p-4 md:p-6 space-y-6 ${dm ? "text-[#f0e3d2]" : "text-[#2f241c]"}`}>

      <div>
        <h2 className="text-4xl font-bold text-[#605146]">Service</h2>
        <p className={`text-xs mt-1 ${dm ? "text-[#c8a882]" : "text-[#605146]/70"}`}>FAQ, quick answers, and live crew chat</p>
      </div>

      <div className={`border rounded-2xl overflow-hidden ${dm ? "bg-[#241c15] border-[#c8a882]/20" : "bg-white/90 border-[#605146]/20"}`}>
        <div className={`flex items-center gap-2 px-5 py-3 border-b ${dm ? "bg-[#2e2318] border-[#c8a882]/15" : "bg-[#605146]/8 border-[#605146]/15"}`}>
          <span>❓</span>
          <h3 className={`text-sm font-black uppercase tracking-wider ${dm ? "text-[#f0e3d2]" : "text-[#2f241c]"}`}>Frequently Asked Questions</h3>
        </div>
        <div className={`divide-y ${dm ? "divide-[#c8a882]/10" : "divide-[#605146]/10"}`}>
          {FAQ.map((item, i) => (
            <div key={i}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition ${dm ? "hover:bg-[#2e2318]" : "hover:bg-[#f0e3d2]/40"}`}
              >
                <span className={`text-sm font-semibold ${dm ? "text-[#f0e3d2]" : ""}`}>{item.q}</span>
                <span className={`text-lg transition-transform duration-200 shrink-0 ml-3 ${openFaq === i ? "rotate-180" : ""} ${dm ? "text-[#c8a882]" : "text-[#605146]"}`}>▾</span>
              </button>
              {openFaq === i && (
                <div className={`px-5 pb-4 text-sm leading-relaxed ${dm ? "bg-[#1e1710] text-[#c8a882]" : "bg-[#f5f0e8]/60 text-[#605146]/80"}`}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={`border rounded-2xl overflow-hidden flex flex-col ${dm ? "bg-[#241c15] border-[#c8a882]/20" : "bg-white/90 border-[#605146]/20"}`}>
        <div className={`flex items-center gap-2 px-5 py-3 border-b ${dm ? "bg-[#2e2318] border-[#c8a882]/15" : "bg-[#605146]/8 border-[#605146]/15"}`}>
          <span>💬</span>
          <h3 className={`text-sm font-black uppercase tracking-wider ${dm ? "text-[#f0e3d2]" : "text-[#2f241c]"}`}>Chat with Our Crew</h3>
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Online
          </span>
        </div>

        <div className="flex flex-col gap-3 p-4 overflow-y-auto max-h-72 min-h-[180px]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              {msg.from === "crew" && (
                <div className="w-7 h-7 rounded-full bg-[#624d2d] text-white text-xs flex items-center justify-center shrink-0 font-bold">☕</div>
              )}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-snug ${
                msg.from === "user"
                  ? "bg-[#2f241c] text-white rounded-br-sm"
                  : dm
                    ? "bg-[#3a2c20] text-[#f0e3d2] border border-[#c8a882]/20 rounded-bl-sm"
                    : "bg-[#f0e3d2] text-[#2f241c] border border-[#605146]/15 rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
              {msg.from === "user" && (
                <div className="w-7 h-7 rounded-full bg-[#605146] text-white text-xs flex items-center justify-center shrink-0 font-bold uppercase">
                  {user?.username?.[0] ?? "U"}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {QUICK_REPLIES.map((qr) => (
            <button
              key={qr}
              type="button"
              onClick={() => sendMessage(qr)}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition ${
                dm
                  ? "bg-[#3a2c20] border-[#c8a882]/30 text-[#d4a96a] hover:bg-[#4a3a28]"
                  : "bg-[#f0e3d2] border-[#605146]/25 text-[#624d2d] hover:bg-[#e0d0ba]"
              }`}
            >
              {qr}
            </button>
          ))}
        </div>

        <div className={`flex gap-2 p-4 pt-2 border-t ${dm ? "border-[#c8a882]/10" : "border-[#605146]/10"}`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition ${
              dm
                ? "bg-[#3a2c20] border-[#c8a882]/25 text-[#f0e3d2] placeholder-[#c8a882]/40 focus:border-[#c8a882]"
                : "bg-[#f9f5f0] border-[#605146]/25 text-[#2f241c] focus:border-[#605146] focus:ring-2 focus:ring-[#605146]/15"
            }`}
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#624d2d] text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
          >
            Send
          </button>
        </div>
      </div>

      <div className={`border rounded-2xl overflow-hidden ${dm ? "bg-[#241c15] border-[#c8a882]/20" : "bg-white/90 border-[#605146]/20"}`}>
        <div className={`flex items-center gap-2 px-5 py-3 border-b ${dm ? "bg-[#2e2318] border-[#c8a882]/15" : "bg-[#605146]/8 border-[#605146]/15"}`}>
          <span>📞</span>
          <h3 className={`text-sm font-black uppercase tracking-wider ${dm ? "text-[#f0e3d2]" : "text-[#2f241c]"}`}>Contact Us</h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          {[
            { icon: "📍", label: "Location", value: "123 Cafe Street, Tanza, Cavite" },
            { icon: "📞", label: "Phone",    value: "+63 912 345 6789" },
            { icon: "✉️", label: "Email",    value: "support@takipsilim.com" },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xl">{icon}</span>
              <div>
                <p className={`font-bold text-xs uppercase opacity-60 ${dm ? "text-[#c8a882]" : ""}`}>{label}</p>
                <p className={dm ? "text-[#f0e3d2]" : ""}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
