import { useAuth } from "../Context/useAuth";
import { usePrefs } from "../Context/PrefsContext";

export const CustomerRank = () => {
    const { user, rankedCustomers } = useAuth();
    const { prefs } = usePrefs();
    const dm = prefs.darkMode;

    const getRankBadge = (rank) => {
        switch (rank) {
            case 1: return <span className="text-2xl">🥇</span>;
            case 2: return <span className="text-2xl">🥈</span>;
            case 3: return <span className="text-2xl">🥉</span>;
            default: return <span className={`font-bold text-sm w-6 text-center ${dm ? "text-[#c8a882]/60" : "text-[#605146]/60"}`}>#{rank}</span>;
        }
    };

    const myRank = rankedCustomers.findIndex(c => c.username === user?.username) + 1;

    return (
        <div className={`p-6 max-w-2xl mx-auto ${dm ? "text-[#f0e3d2]" : "text-[#605146]"}`}>
            <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold tracking-wide ${dm ? "text-[#d4a96a]" : "text-[#605146]"}`}>🏆 TOP CUSTOMER RANK</h3>
                <p className="text-xs opacity-75 mt-1 italic">Our most loyal coffee lovers this month</p>
            </div>

            {user && myRank > 0 && (
                <div className={`mb-4 px-4 py-3 rounded-xl border text-sm text-center ${dm ? "bg-[#2e2318] border-[#c8a882]/20" : "bg-[#605146]/10 border-[#605146]/20"}`}>
                    You are ranked <span className={`font-black ${dm ? "text-[#d4a96a]" : "text-[#624d2d]"}`}>#{myRank}</span> with{" "}
                    <span className={`font-black ${dm ? "text-[#d4a96a]" : "text-[#624d2d]"}`}>{rankedCustomers[myRank - 1]?.orders ?? 0}</span>{" "}
                    {rankedCustomers[myRank - 1]?.orders === 1 ? "order" : "orders"}
                </div>
            )}

            <div className="flex flex-col gap-3">
                {rankedCustomers.length === 0 ? (
                    <p className="text-center opacity-60 text-sm py-6">No orders placed yet.</p>
                ) : (
                    rankedCustomers.map((customer, index) => {
                        const rank = index + 1;
                        const isMe = customer.username === user?.username;
                        return (
                            <div key={customer.username}
                                className={`grid grid-cols-3 items-center p-4 rounded-xl shadow-sm border transition-all duration-300 hover:scale-[1.01] ${
                                    rank === 1
                                        ? "bg-[#ffde59]/20 border-[#ffde59]"
                                        : isMe
                                        ? dm ? "bg-[#3a2c20] border-[#c8a882]/40" : "bg-[#605146]/10 border-[#605146]/40"
                                        : dm ? "bg-[#2e2318] border-[#c8a882]/15" : "bg-white border-[#605146]/10"
                                }`}>
                                <div className="flex items-center justify-start">
                                    <div className="w-8 flex justify-center">{getRankBadge(rank)}</div>
                                </div>
                                <div className="flex justify-center">
                                    <span className={`font-bold text-sm px-3 py-1 rounded-full whitespace-nowrap ${dm ? "bg-[#c8a882]/15 text-[#c8a882]" : "bg-[#605146]/10 text-[#605146]"}`}>
                                        {customer.orders} {customer.orders === 1 ? "Order" : "Orders"}
                                    </span>
                                </div>
                                <div className="flex justify-end items-center gap-1.5">
                                    {isMe && <span className="text-[10px] font-bold bg-[#624d2d] text-white px-1.5 py-0.5 rounded-full">You</span>}
                                    <span className={`font-semibold text-base text-right ${rank === 1 ? "text-amber-500 font-bold" : dm ? "text-[#f0e3d2]" : "text-[#2f241c]"}`}>
                                        {customer.name}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
