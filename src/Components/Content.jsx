import { useState } from "react";
import { useAuth } from "../Context/useAuth";
import { usePrefs } from "../Context/PrefsContext";
import { Announcement } from "./Announcement"
import { Menu } from "./Menu"
import { CustomerRank } from "./CustomerRanking";
import { Delivery } from "./Delivery";
import { useCart } from "../Context/useCart"; 
import { History } from "./History";
import { SavedSips } from "./SavedSips";
import { CheckAndPay } from "./CheckAndPay";
import { Setting } from "./Setting";
import { Service } from "./Service";

export const Content = ({ activeLink, setActiveLink }) => {
  const { user } = useAuth();
  const { prefs } = usePrefs();
  const dm = prefs.darkMode;
  const [activeTab, setActiveTab] = useState(0);
  const tabpanel = ["ANNOUNCEMENT", "MENU", "CUSTOMER RANK"];
  const { cartItems, cartTotal, placeOrder } = useCart();

  if (!user) return null;

  const renderHomeSubTabs = () => {
    switch (activeTab) {
      case 0: return <Announcement />;
      case 1: return <Menu />;
      case 2: return <CustomerRank />;
      default: return null;
    }
  };

  const renderMainContent = () => {
    switch (activeLink) {
      case "Home":
        return (
          <>
            <div className={`flex p-1.5 rounded-xl gap-1 shadow-inner border ${dm ? "bg-[#2e2318] border-[#c8a882]/20" : "bg-[#f0e3d2]/60 border-[#605146]/10"}`}>
              {tabpanel.map((tab, i) => (
                <button key={i} onClick={() => setActiveTab(i)}
                  className={`flex-1 py-2.5 text-[11px] sm:text-sm font-semibold tracking-wide rounded-lg transition-all duration-300 ${
                    activeTab === i
                      ? "bg-[#624d2d] text-white shadow-md scale-[1.02]"
                      : dm ? "text-[#c8a882] hover:bg-[#3a2c20]" : "text-[#2f241c] hover:bg-[#605146]/10 hover:text-[#605146]"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className={`mt-4 rounded-xl border shadow-md min-h-[200px] transition-all my-5 ${dm ? "bg-[#241c15] border-[#c8a882]/15" : "bg-[#f0e3d2] border-[#605146]/10"}`}>
              {renderHomeSubTabs()}
            </div>
          </>
        );
      case "Delivery":   return <Delivery />;
      case "Saved Sips": return <SavedSips />;
      case "History":    return <History />;
      case "Check & Pay": return <CheckAndPay setActiveLink={setActiveLink} />;
      case "Setting":    return <Setting />;
      case "Service":    return <Service />;
      default:           return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-4 px-3 pb-6">
      {renderMainContent()}
    </div>
  );
};