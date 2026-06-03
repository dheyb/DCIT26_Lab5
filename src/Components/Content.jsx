import { useState } from "react";
import { useAuth } from "../Context/useAuth";
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
  const [activeTab, setActiveTab] = useState(0);
  const tabpanel = ["ANNOUNCEMENT", "MENU", "CUSTOMER RANK"];
  const { cartItems, cartTotal, placeOrder } = useCart();

   if (!user) {
    return null; 
  }

  const renderHomeSubTabs = () => {
    switch (activeTab) {
      case 0:
        return <Announcement />;
      case 1:
        return <Menu />;
      case 2:
        return <CustomerRank />
      default:
        return null;
    }
  };

  const renderMainContent = () => {
    switch (activeLink) {
      case "Home":
        return (
          <>
            <div className="flex bg-[#f0e3d2]/60 p-1.5 rounded-xl gap-2 shadow-inner border border-[#605146]/10">
              {tabpanel.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 py-3 text-sm font-semibold tracking-wider rounded-lg transition-all duration-300 ${activeTab === i
                      ? "bg-[#b4b4b4] text-[black] shadow-md scale-[1.02]"
                      : "text-[black] hover:bg-[#605146]/10 hover:text-[#605146]"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-4 bg-[#f0e3d2] rounded-xl border border-[#605146]/10 shadow-md min-h-[200px] transition-all my-5">
              {renderHomeSubTabs()}
            </div>
          </>
        );
      case "Delivery":
        return <Delivery />;
      case "Saved Sips": // or "Saved Ships" if your nav uses that
        return <SavedSips />;
      case "History":
        return <History />;
      case "Check & Pay":
        return <CheckAndPay setActiveLink={setActiveLink} />;
      case "Setting":
        return <Setting />;
      case "Service":
        return <Service />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 px-3">
      {renderMainContent()}
    </div>
  );
};