import { useAuth } from "../Context/useAuth";

export const CustomerRank = () => {
    const { user, rankedCustomers } = useAuth();

    const getRankBadge = (rank) => {
        switch (rank) {
            case 1: return <span className="text-2xl">🥇</span>;
            case 2: return <span className="text-2xl">🥈</span>;
            case 3: return <span className="text-2xl">🥉</span>;
            default: return <span className="font-bold text-sm text-[#605146]/60 w-6 text-center">#{rank}</span>;
        }
    };

    const myRank = rankedCustomers.findIndex(c => c.username === user?.username) + 1;

    return (
        <div className="p-6 text-[#605146] max-w-2xl mx-auto">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold tracking-wide">🏆 TOP CUSTOMER RANK</h3>
                <p className="text-xs opacity-75 mt-1 italic">Our most loyal coffee lovers this month</p>
            </div>

            {/* Current user's rank summary */}
            {user && myRank > 0 && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-[#605146]/10 border border-[#605146]/20 text-sm text-center">
                    You are ranked <span className="font-black text-[#624d2d]">#{myRank}</span> with{" "}
                    <span className="font-black text-[#624d2d]">
                        {rankedCustomers[myRank - 1]?.orders ?? 0}
                    </span>{" "}
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
                            <div
                                key={customer.username}
                                className={`grid grid-cols-3 items-center p-4 rounded-xl shadow-sm border transition-all duration-300 hover:scale-[1.01] ${
                                    rank === 1
                                        ? "bg-[#ffde59]/20 border-[#ffde59]"
                                        : isMe
                                        ? "bg-[#605146]/10 border-[#605146]/40"
                                        : "bg-white border-[#605146]/10"
                                }`}
                            >
                                <div className="flex items-center justify-start">
                                    <div className="w-8 flex justify-center">
                                        {getRankBadge(rank)}
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <span className="font-bold text-sm bg-[#605146]/10 px-3 py-1 rounded-full whitespace-nowrap">
                                        {customer.orders} {customer.orders === 1 ? "Order" : "Orders"}
                                    </span>
                                </div>

                                <div className="flex justify-end items-center gap-1.5">
                                    {isMe && (
                                        <span className="text-[10px] font-bold bg-[#624d2d] text-white px-1.5 py-0.5 rounded-full">
                                            You
                                        </span>
                                    )}
                                    <span className={`font-semibold text-base text-right ${rank === 1 ? "text-amber-900 font-bold" : ""}`}>
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
