import { useEffect, useState } from "react";
import { useCart } from "../Context/useCart";
import { useToastContext } from "../Context/ToastContext";
import { usePrefs } from "../Context/PrefsContext";

const STORAGE_KEY = "takipsilim_saved_sips";
const DEMO_IDS = [];
const PLACEHOLDER_IMAGE = "https://placehold.co/200x200/f0e3d2/605146?text=No+Image";

const loadSavedFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  return null;
};

const cleanDemoItems = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter((x) => !DEMO_IDS.includes(x.id));
};

export const SavedSips = () => {
  const { addToCart } = useCart();
  const { showToast } = useToastContext();
  const { prefs } = usePrefs();
  const dm = prefs.darkMode;
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    const init = () => {
      const fromStorage = loadSavedFromStorage();
      if (fromStorage && Array.isArray(fromStorage)) {
        const cleaned = cleanDemoItems(fromStorage);
        setSaved(cleaned);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      } else {
        setSaved([]);
      }
    };

    init();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        const list = loadSavedFromStorage();
        if (list && Array.isArray(list)) {
          setSaved(cleanDemoItems(list));
        }
      }
    };

    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        const list = loadSavedFromStorage();
        if (list && Array.isArray(list)) setSaved(cleanDemoItems(list));
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const persist = (items) => {
    setSaved(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const removeSaved = (id) => {
    persist(saved.filter((x) => x.id !== id));
  };

  const handleAddToCart = (item) => {
    addToCart(
      { id: item.id, name: item.name, price: item.price, image: item.image },
      1
    );
    showToast(`${item.name} has been added to your cart.`, "success");
  };

  return (
    <div className={`p-5 rounded-xl border shadow-md ${dm ? "bg-[#241c15] border-[#c8a882]/20" : "bg-[#f5f0e8] border-[#605146]/20"}`}>
      <h2 className={`text-4xl font-bold text-center mb-6 ${dm ? "text-[#d4a96a]" : "text-[#605146]"}`}>
        Saved Sips
      </h2>

      <div className={`rounded-3xl border-2 p-6 ${dm ? "border-[#c8a882]/30 bg-[#2e2318]" : "border-black/80 bg-[#e9dcc9]"}`}>
        {saved.length === 0 ? (
          <p className={`text-center py-8 ${dm ? "text-[#c8a882]" : "text-[#605146]"}`}>
            No saved sips yet. Save drinks from the Menu with ♥.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {saved.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl overflow-hidden flex flex-col border ${dm ? "bg-[#3a2c20] border-[#c8a882]/30" : "bg-white border-black/50"}`}
              >
                <div className={`aspect-square overflow-hidden ${dm ? "bg-[#4a3a28]" : "bg-[#f0e3d2]/40"}`}>
                  <img
                    src={item.image || PLACEHOLDER_IMAGE}
                    alt={item.name}
                    className="h-full w-full min-h-full min-w-full object-cover object-center scale-[1.06]"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>
                <div className="p-3 flex flex-col flex-1 gap-2">
                  <p className={`font-black text-sm text-center uppercase tracking-wide ${dm ? "text-[#f0e3d2]" : "text-[#2f241c]"}`}>
                    {item.name}
                  </p>
                  <p className={`text-center font-bold ${dm ? "text-[#d4a96a]" : "text-[#624d2d]"}`}>₱{item.price}</p>
                  <div className="flex gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg hover:opacity-90 ${dm ? "bg-[#624d2d] text-[#f0e3d2]" : "bg-[#2f241c] text-white"}`}
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSaved(item.id)}
                      className={`w-10 shrink-0 rounded-lg flex items-center justify-center text-lg ${dm ? "bg-[#624d2d] text-[#f0e3d2]" : "bg-[#2f241c] text-white"}`}
                      title="Remove from saved"
                    >
                      ☕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};