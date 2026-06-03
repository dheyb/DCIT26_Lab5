import { useState, useEffect } from "react"
import { ProductsData } from "../assets/Utils/ProductList.jsx"
import { useCart } from "../Context/useCart";
import { useToastContext } from "../Context/ToastContext";
import { usePrefs } from "../Context/PrefsContext";
import { useReviews } from "../Context/ReviewContext";

const menuItems = ProductsData;

export const Menu = () => {
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showReviewsFor, setShowReviewsFor] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToastContext();
    const { prefs } = usePrefs();
    const compact = prefs.compactView;
    const dm = prefs.darkMode;
    const { getItemAvgRating, getItemReviews, loadItemReviews } = useReviews();

    useEffect(() => {
        if (!selectedMenu) return;
        const items = ProductsData[selectedMenu] || [];
        items.forEach(item => loadItemReviews(item.id));
    }, [selectedMenu]);

    const menuCategory = [
        "Coffee Based", 
        "Non - Coffee Based", 
        "Frapped Based", 
        "Rice Meals", 
        "Chicken Wings"
    ];

    const handleOpenQuantityModal = (item) => {
        setSelectedItem(item);
        setQuantity(1);
        setShowModal(true);
    };

    const handleIncrement = () => {
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const { addToCart } = useCart();

const handleConfirmAddToCart = () => {
  addToCart(selectedItem, quantity);
  setShowModal(false);
  showToast(`${selectedItem.name} (x${quantity}) has been added to your cart.`, "success");
};

const STORAGE_KEY = `takipsilim_saved_sips_${(() => { try { const u = localStorage.getItem("auth_user"); return u ? JSON.parse(u).username : "guest"; } catch { return "guest"; } })()}`;

const saveSipToLocal = (item) => {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!list.some((x) => x.id === item.id)) {
      list.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      showToast(`${item.name} has been added to your Saved Sips.`, "success");
    } else {
      showToast("This item is already in your Saved Sips.", "info");
    }
  } catch {
    showToast("Unable to save this item. Please try again.", "error");
  }
};

    return (
        <div className="menu-container max-w-4xl mx-auto px-4 py-6 relative">
            
            {showReviewsFor && (() => {
                const item = menuItems[selectedMenu]?.find(i => i.id === showReviewsFor);
                const reviews = getItemReviews(showReviewsFor);
                const avg = getItemAvgRating(showReviewsFor);
                
                if (!item) return null;
                
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
                        <div className={`rounded-2xl p-5 max-w-lg w-full shadow-2xl relative animate-scale-up max-h-[80vh] overflow-y-auto ${dm ? "bg-[#241c15] border border-[#c8a882]/20" : "bg-white border border-gray-100"}`}>
                            <button 
                                onClick={() => setShowReviewsFor(null)}
                                className={`absolute top-3 right-3 font-bold text-sm ${dm ? "text-[#c8a882] hover:text-[#f0e3d2]" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                ✕
                            </button>
                            
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-16 h-16 rounded-xl overflow-hidden border ${dm ? "bg-[#3a2c20] border-[#c8a882]/20" : "bg-gray-100 border-gray-200"}`}>
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`text-base font-black uppercase tracking-wide capitalize ${dm ? "text-[#d4a96a]" : "text-[#605146]"}`}>
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[1,2,3,4,5].map(s => (
                                            <span key={s} className={`text-base ${s <= Math.round(avg) ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                                        ))}
                                        <span className={`text-xs ml-1 ${dm ? "text-[#c8a882]" : "text-gray-600"}`}>
                                            {avg.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={`border-t pt-4 space-y-3 ${dm ? "border-[#c8a882]/15" : "border-gray-200"}`}>
                                {reviews.length === 0 ? (
                                    <p className={`text-sm text-center py-4 ${dm ? "text-[#c8a882]" : "text-gray-500"}`}>
                                        No reviews yet for this item.
                                    </p>
                                ) : (
                                    reviews.map((review, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`pb-3 border-b last:border-0 ${dm ? "border-[#c8a882]/10" : "border-gray-100"}`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className={`text-sm font-bold ${dm ? "text-[#f0e3d2]" : "text-[#2f241c]"}`}>
                                                        {review.username}
                                                    </p>
                                                    <div className="flex gap-0.5 mt-1">
                                                        {[1,2,3,4,5].map(s => (
                                                            <span key={s} className={`text-xs ${s <= review.rating ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className={`text-xs ${dm ? "text-[#c8a882]/70" : "text-gray-500"}`}>
                                                    {review.date}
                                                </span>
                                            </div>
                                            {review.comment && (
                                                <p className={`text-sm leading-relaxed ${dm ? "text-[#c8a882]" : "text-gray-700"}`}>
                                                    {review.comment}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowReviewsFor(null)}
                                className={`w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition ${dm ? "bg-[#624d2d] text-[#f0e3d2] hover:opacity-90" : "bg-[#2f241c] text-white hover:opacity-90"}`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                );
            })()}

            {showModal && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
                    <div className={`rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl relative animate-scale-up ${dm ? "bg-[#241c15] border border-[#c8a882]/20" : "bg-white border border-gray-100"}`}>
                        <button 
                            onClick={() => setShowModal(false)}
                            className={`absolute top-3 right-3 font-bold text-sm ${dm ? "text-[#c8a882] hover:text-[#f0e3d2]" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            ✕
                        </button>
                        
                        <div className={`w-20 h-20 rounded-xl overflow-hidden mx-auto mb-3 border ${dm ? "bg-[#3a2c20] border-[#c8a882]/20" : "bg-gray-100 border-gray-200"}`}>
                            <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <h3 className={`text-base font-black uppercase tracking-wide capitalize ${dm ? "text-[#d4a96a]" : "text-[#605146]"}`}>{selectedItem.name}</h3>
                        <p className={`text-sm font-bold mt-0.5 ${dm ? "text-[#c8a882]" : "text-[#624d2d]"}`}>₱{selectedItem.price}</p>
                        
                        <div className="flex items-center justify-center gap-4 my-5">
                            <button 
                                type="button"
                                onClick={handleDecrement}
                                className={`w-10 h-10 font-black text-lg rounded-full transition-all active:scale-90 ${dm ? "bg-[#3a2c20] hover:bg-[#4a3a28] text-[#f0e3d2]" : "bg-gray-200 hover:bg-gray-300 text-[#605146]"}`}
                            >
                                -
                            </button>
                            <span className={`text-xl font-black w-8 ${dm ? "text-[#f0e3d2]" : "text-gray-800"}`}>{quantity}</span>
                            <button 
                                type="button"
                                onClick={handleIncrement}
                                className={`w-10 h-10 font-black text-lg rounded-full transition-all active:scale-90 ${dm ? "bg-[#3a2c20] hover:bg-[#4a3a28] text-[#f0e3d2]" : "bg-gray-200 hover:bg-gray-300 text-[#605146]"}`}
                            >
                                +
                            </button>
                        </div>

                        <div className={`border-t pt-4 flex flex-col gap-2 ${dm ? "border-[#c8a882]/15" : "border-gray-100"}`}>
                            <div className={`flex justify-between items-center text-xs font-bold px-1 ${dm ? "text-[#c8a882]" : "text-gray-500"}`}>
                                <span>Total Price:</span>
                                <span className={`text-sm font-black ${dm ? "text-[#d4a96a]" : "text-[#624d2d]"}`}>₱{selectedItem.price * quantity}</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleConfirmAddToCart}
                                className="w-full py-2.5 bg-[#00bf63] hover:bg-[#009e52] text-white text-sm font-bold rounded-xl shadow-sm transition-colors active:scale-[0.97]"
                            >
                                Confirm Order ☕
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!selectedMenu && (
                <div className="animate-fade-in max-w-2xl mx-auto">
                    {loading && (
                        <div className="text-center py-8">
                            <p className={`text-sm ${dm ? "text-[#c8a882]" : "text-gray-500"}`}>Loading menu...</p>
                        </div>
                    )}
                    <div className="p-2 text-center sm:text-left">
                        <h2 className={`text-xl font-bold uppercase tracking-wider ${dm ? "text-[#d4a96a]" : "text-[#605146]"}`}>📋 MENU CATEGORIES</h2>
                        <p className={`text-xs mt-1 ${dm ? "text-[#c8a882]" : "text-gray-500"}`}>Select a category to view our delicious offerings</p>
                    </div>

                    <hr className={`my-3 ${dm ? "border-[#c8a882]/20" : "border-gray-300"}`} />

                    <div className="flex flex-col gap-3 w-full px-1">
                        {menuCategory.map((menu, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedMenu(menu)}
                                className={`w-full px-5 py-4 font-semibold text-base rounded-xl transition-all shadow-md border flex justify-between items-center active:scale-[0.99] ${
                                    dm
                                        ? "bg-[#2e2318] text-[#f0e3d2] border-[#c8a882]/20 hover:bg-[#624d2d] hover:text-white"
                                        : "bg-white text-black border-black/10 hover:bg-[#4a3a22] hover:text-white"
                                }`}
                            >
                                <span>{menu}</span>
                                <span className="text-xs opacity-60">View Items ➔</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selectedMenu && (
                <div className="animate-fade-in">
                    <div className="p-2 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold uppercase tracking-wider text-[#605146]">
                                {selectedMenu}
                            </h2>
                            <p className={`text-xs mt-1 ${dm ? "text-[#c8a882]" : "text-gray-500"}`}>Freshly prepared for you</p>
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => setSelectedMenu(null)}
                            className={`px-4 py-2 font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap ${dm ? "bg-[#3a2c20] text-[#f0e3d2] hover:bg-[#4a3a28]" : "bg-gray-200 text-[#605146] hover:bg-gray-300"}`}
                        >
                            ⬅️ Back
                        </button>
                    </div>

                    <hr className="my-3 border-gray-300" />
                    
                    <div className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"}`}>
                        {menuItems[selectedMenu] && menuItems[selectedMenu].map((item) => (
                            <div 
                                key={item.id} 
                                className="bg-white rounded-2xl shadow-sm border border-[#605146]/15 overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <div className="w-full aspect-square overflow-hidden bg-[#f0e3d2]">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                
                                <div className={`flex flex-col gap-1.5 flex-1 bg-[#8f703a] ${compact ? "p-2" : "p-3 gap-2"}`}>
                                    <h4 className={`font-bold text-white text-center capitalize leading-snug line-clamp-2 flex items-center justify-center ${compact ? "text-xs min-h-[2rem]" : "text-sm min-h-[2.5rem]"}`}>
                                        {item.name}
                                    </h4>

                                    <p className={`font-black text-center text-[#ffde59] ${compact ? "text-sm" : "text-base"}`}>
                                        ₱{item.price}
                                    </p>

                                    <div className="flex flex-col gap-0.5 items-center">
                                        <div className="flex items-center justify-center gap-0.5">
                                            {(() => {
                                                const avg = getItemAvgRating(item.id);
                                                const reviewCount = getItemReviews(item.id).length;
                                                const displayRating = avg > 0 ? avg : 0;
                                                const roundedRating = Math.round(displayRating);
                                                return (
                                                    <>
                                                        {[1,2,3,4,5].map(s => (
                                                            <span
                                                                key={s}
                                                                className={`${compact ? "text-xs" : "text-sm"} ${s <= roundedRating ? "text-yellow-400" : "text-white/40"}`}
                                                            >
                                                                ★
                                                            </span>
                                                        ))}
                                                        {reviewCount > 0 && !compact && (
                                                            <span className="text-[10px] text-white/80 ml-0.5 font-semibold">
                                                                {displayRating.toFixed(1)} ({reviewCount})
                                                            </span>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        {(() => {
                                            const reviewCount = getItemReviews(item.id).length;
                                            if (reviewCount > 0) {
                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowReviewsFor(showReviewsFor === item.id ? null : item.id);
                                                        }}
                                                        className={`text-white/80 underline hover:text-white transition ${compact ? "text-[9px]" : "text-[10px]"}`}
                                                    >
                                                        {showReviewsFor === item.id ? "Hide" : `${reviewCount} review${reviewCount > 1 ? "s" : ""}`}
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>

                                    <div className={`flex mt-auto ${compact ? "gap-1" : "gap-2"}`}>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenQuantityModal(item)}
                                            className={`flex-1 bg-[#00bf63] hover:bg-[#009e52] text-white font-bold rounded-xl shadow-sm transition-colors active:scale-[0.97] ${compact ? "py-1.5 text-[10px]" : "py-2 text-xs"}`}
                                        >
                                            {compact ? "Add" : "Add to Cart"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => saveSipToLocal(item)}
                                            className={`flex items-center justify-center bg-[#2f241c] hover:bg-[#4a3a22] text-white rounded-xl shadow-sm active:scale-[0.97] transition-colors ${compact ? "w-7 text-xs" : "w-9 text-sm"}`}
                                            title="Save sip"
                                        >
                                            ♥
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};