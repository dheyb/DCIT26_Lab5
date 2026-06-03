import { useState } from "react"
import { useAuth } from "../Context/useAuth";
import { useToastContext } from "../Context/ToastContext";
import { usePrefs } from "../Context/PrefsContext";
import '../assets/Css/Announcement.css'
import megaphone from "../assets/Images/megaphone.png"

export const Announcement = () => {

    const { user } = useAuth();
    const { showToast } = useToastContext();
    const { prefs } = usePrefs();
    const dm = prefs.darkMode;
    const [showForm, setShowForm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [bookedDates, setBookedDates] = useState([]);
    const [isDateProhibited, setIsDateProhibited] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        date: "",
        guests: "",
        occasion: "",
        message: ""
    });

    if (!user) return null;

    const today = new Date().toLocaleDateString('en-CA');

    const announcements = [
        {
            id: 1,
            title: "LIMITED TIME OFFER",
            date: "2026-05-19T02:30:00",
            content: "Get a FREE upgrade to large size for any drink today only!",
            button: "Claim"
        },
        {
            id: 2,
            title: "LIVE MUSIC NIGHT",
            date: "2026-05-18T15:00:00",
            content: "Join us this Friday for Live Acoustic Night at 6PM!",
            button: "Reserve"
        },
        {
            id: 3,
            title: "FLASH SALES",
            date: "2026-05-10T10:00:00",
            content: "For the next 2 hours Buy 1 Take 1 on all Frappes ",
            button: "Claim"
        }
    ];

    const getRelativeTime = (postDateString) => {
        const postDate = new Date(postDateString);
        const now = new Date();
        const diffInMs = now - postDate;
        
        if (diffInMs < 0) return "Just now"; 
        
        const diffInSecs = Math.floor(diffInMs / 1000);
        if (diffInSecs < 60) return "Just now";

        const diffInMins = Math.floor(diffInSecs / 60);
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMins < 60) return `${diffInMins} ${diffInMins === 1 ? "minute" : "minutes"} ago`;
        if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
        return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    };

    const handleButtonClick = (buttonType) => {
        if (buttonType === "Reserve") {
            setShowForm(true);
        } else {
            showToast(`${buttonType} offer has been claimed. Thank you!`, "success");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "date") {
            if (bookedDates.includes(value)) {
                setIsDateProhibited(true);
                setFormData(prev => ({ ...prev, date: "" }));
                showToast("The selected date is fully booked. Please choose a different date.", "error");
                return;
            } else {
                setIsDateProhibited(false);
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormClose = () => {
        setShowForm(false);
        setIsDateProhibited(false);
        setFormData({ name: "", email: "", phone: "", date: "", guests: "", occasion: "", message: "" });
    };

    const handleConfirm = (e) => {
        e.preventDefault();

        if (bookedDates.includes(formData.date)) {
            showToast("The selected date is already booked. Please choose another date.", "error");
            return;
        }

        setBookedDates(prev => [...prev, formData.date]);
        handleFormClose();
        setShowConfirm(true);
    };

    const filteredAnnouncements = announcements.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-fade-in">
                    <div className="form-container relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#f0e3d2] rounded-2xl shadow-2xl border border-[#605146]/20 p-6 text-[#605146] animate-scale-up">
                        <button
                            type="button"
                            onClick={handleFormClose}
                            className="absolute top-4 right-4 text-xl font-bold opacity-60 hover:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold">📅 Book a Table</h3>
                        </div>
                        <form className="flex flex-col gap-4" onSubmit={handleConfirm}>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold uppercase opacity-80">Full Name</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Juan Dela Cruz" className="p-2.5 rounded-lg border border-[#605146]/20 outline-none focus:border-[#624d2d] bg-white" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold uppercase opacity-80">Email Address</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="juan@gmail.com" className="p-2.5 rounded-lg border border-[#605146]/20 outline-none focus:border-[#624d2d] bg-white" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold uppercase opacity-80">Phone Number</label>
                                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="09123456789" className="p-2.5 rounded-lg border border-[#605146]/20 outline-none focus:border-[#624d2d] bg-white" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1 relative">
                                    <label className="text-xs font-semibold uppercase opacity-80 flex justify-between">
                                        Date {isDateProhibited && <span className="text-red-600 font-bold animate-pulse">🚫 Fully Booked</span>}
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        name="date"
                                        min={today}
                                        value={formData.date}
                                        className={`p-2.5 rounded-lg border outline-none text-sm bg-white ${isDateProhibited ? "border-red-500 bg-red-50" : "border-[#605146]/20 focus:border-[#624d2d]"}`}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold uppercase opacity-80">Guests</label>
                                    <select required name="guests" value={formData.guests} onChange={handleInputChange} className="p-2.5 rounded-lg border border-[#605146]/20 outline-none focus:border-[#624d2d] bg-white text-sm">
                                        <option value="" disabled>How many pax?</option>
                                        {Array.from({ length: 5 }, (_, i) => {
                                            const value = i + 1;
                                            return (
                                                <option key={value} value={value}>
                                                    {value} {value === 1 ? "Person" : "People"}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold uppercase opacity-80">Occasion</label>
                                <input type="text" name="occasion" value={formData.occasion} onChange={handleInputChange} placeholder="e.g., Birthday, Anniversary" className="p-2.5 rounded-lg border border-[#605146]/20 outline-none focus:border-[#624d2d] bg-white" />
                            </div>

                            <textarea name="message" value={formData.message} onChange={handleInputChange} className="p-2.5 rounded-lg border border-[#605146]/20 outline-none focus:border-[#624d2d] bg-white min-h-[80px]"
                                placeholder="Leave a Message For Payment Before Confirmation"></textarea>

                            <button type="submit" className="w-full mt-2 bg-[#624d2d] text-white p-3 rounded-xl font-semibold hover:bg-[#4a3a22] transition-colors shadow-md">
                                Confirm Reservation
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-fade-in">
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center border border-gray-200">
                        <div className="text-4xl mb-3">✅</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Successfully Reserved !</h3>
                        <p className="text-sm text-gray-600 mb-5">
                          Table No. : 007
                        </p>
                        <small>Notes: Take a screenshot of this, then show it to our staff when you came in, in our shop</small>
                        <button
                            type="button"
                            onClick={() => setShowConfirm(false)}
                            className="bg-[#624d2d] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-[#4a3a22] transition-colors shadow-md"
                        >
                            Okay, Got it!
                        </button>
                    </div>
                </div>
            )}

            <div className="announcement-container max-w-5xl mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-3">
                    <div className="col">
                        <h2 className="text-xl font-bold">📢 ANNOUNCEMENT</h2>
                    </div>
                    <div className="w-full sm:w-auto sm:min-w-[250px]">
                        <input
                            type="search"
                            className={`py-2 px-3 rounded-lg w-full outline-none shadow-md border focus:border-[#624d2d] ${
                                dm
                                    ? "bg-[#3a2c20] text-[#f0e3d2] border-[#c8a882]/30 placeholder-[#c8a882]/50"
                                    : "bg-white text-black border-gray-200"
                            }`}
                            placeholder="Search announcements..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <hr className="my-3 border-gray-300" />

                <div className="announcement-list flex flex-col gap-3">
                    {filteredAnnouncements.length > 0 ? (
                        filteredAnnouncements.map((item) => (
                            <div key={item.id} className="announcement-card bg-[#624d2d] p-4 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-md mx-1">
                                <div className="card-header text-white flex flex-row items-start gap-3">
                                    <div className="flex-shrink-0 bg-white/10 rounded-lg p-2">
                                        <img src={megaphone} className="w-10 h-10 object-contain" alt="announcement" />
                                    </div>
                                    <div className="flex flex-col alignment-start">
                                        <h3 className="font-bold text-base md:text-lg leading-tight text-[#ffde59]">{item.title}</h3>
                                        <p className="card-content text-sm opacity-90 mt-1">{item.content}</p>
                                    </div>
                                </div>
                                <div className="flex flex-row sm:justify-end items-center justify-between text-white border-t border-white/10 md:border-t-0 pt-3 md:pt-0 gap-4 flex-shrink-0">
                                    <span className="date text-xs opacity-75 italic whitespace-nowrap">
                                        {getRelativeTime(item.date)}
                                    </span>
                                    <button
                                        type="button"
                                        className={`py-2 px-4 rounded-lg font-semibold transition-colors text-sm shadow-sm ${
                                            dm
                                                ? "bg-[#d4a96a] hover:bg-[#c8952e] text-[#1a1410]"
                                                : "bg-[#ffde59] hover:bg-[#e0c33e] text-black"
                                        }`}
                                        onClick={() => handleButtonClick(item.button)}
                                    >
                                        {item.button}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={`text-center p-6 opacity-70 ${dm ? "text-[#c8a882]" : "text-gray-500"}`}>No announcements found matching your search.</p>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-4 bg-[#624d2d] text-white rounded-xl shadow-md border border-black/20 m-1 mt-4 text-center sm:text-left">
                        <h5 className="font-medium text-sm md:text-base">Reserve A Table For Your Special Occasion</h5>
                        <button 
                            type="button" 
                            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm whitespace-nowrap shadow-sm ${
                                dm
                                    ? "bg-[#d4a96a] hover:bg-[#c8952e] text-[#1a1410]"
                                    : "bg-[#ffde59] hover:bg-[#e0c33e] text-black"
                            }`}
                            onClick={() => setShowForm(true)}
                        >
                            Fill Up Form
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};