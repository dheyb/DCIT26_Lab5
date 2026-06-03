import { useEffect, useRef, useState } from "react";
import { useToastContext } from "../Context/ToastContext";
import { useAuth } from "../Context/useAuth";
import { usePrefs } from "../Context/PrefsContext";
import api from "../config/api";

const STORAGE_KEY = "takipsilim_customer_profile";
const PREFS_KEY   = "takipsilim_preferences";

const defaultProfile = { fullName: "", email: "", phone: "", address: "", bio: "", photo: null };
const defaultPrefs   = { orderNotif: true, promoNotif: false, darkMode: false, compactView: false };

const Section = ({ title, icon, children, dm }) => (
  <div className={`border rounded-2xl overflow-hidden ${dm ? "bg-[#241c15] border-[#c8a882]/20" : "bg-white/90 border-[#605146]/20"}`}>
    <div className={`flex items-center gap-2 px-5 py-3 border-b ${dm ? "bg-[#2e2318] border-[#c8a882]/15" : "bg-[#605146]/8 border-[#605146]/15"}`}>
      <span className="text-base">{icon}</span>
      <h3 className={`text-sm font-black uppercase tracking-wider ${dm ? "text-[#f0e3d2]" : "text-[#2f241c]"}`}>{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Field = ({ label, children, dm }) => (
  <div className="flex flex-col gap-1.5">
    <label className={`text-xs font-bold uppercase tracking-wide ${dm ? "text-[#c8a882]" : "text-[#605146]/80"}`}>{label}</label>
    {children}
  </div>
);

const getInputCls = (dm) => `w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 transition ${
  dm
    ? "bg-[#3a2c20] border-[#c8a882]/25 text-[#f0e3d2] placeholder-[#c8a882]/40 focus:border-[#c8a882] focus:ring-[#c8a882]/15"
    : "bg-white border-[#605146]/25 text-[#2f241c] focus:border-[#605146] focus:ring-[#605146]/15"
}`;

const Toggle = ({ checked, onChange, label, sub, dm }) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <div>
      <p className={`text-sm font-semibold ${dm ? "text-[#f0e3d2]" : "text-[#2f241c]"}`}>{label}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
    <div
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${checked ? "bg-[#624d2d]" : "bg-gray-300"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : ""}`} />
    </div>
  </label>
);

export const Setting = () => {
  const { showToast } = useToastContext();
  const { handleLogout, user } = useAuth();
  const { reloadPrefs, prefs: globalPrefs } = usePrefs();
  const dm = globalPrefs.darkMode;

  const [profile, setProfile]     = useState(defaultProfile);
  const [prefs, setPrefs]         = useState(defaultPrefs);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm]       = useState({ current: "", next: "", confirm: "" });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      const fromUser = {
        ...defaultProfile,
        fullName: user?.name  || "",
        email:    user?.email || "",
        phone:    user?.phone || "",
      };
      try {
        const res = await api.get("/profile");
        const dbProfile = res.data;
        setProfile({
          ...fromUser,
          fullName: dbProfile.full_name || fromUser.fullName,
          email:    dbProfile.email     || fromUser.email,
          phone:    dbProfile.phone     || fromUser.phone,
          address:  dbProfile.address   || "",
          bio:      dbProfile.bio       || "",
        });
      } catch {
        setProfile(fromUser);
      }
      try {
        const rawP = localStorage.getItem(PREFS_KEY);
        if (rawP) setPrefs({ ...defaultPrefs, ...JSON.parse(rawP) });
      } catch {}
    };
    loadProfile();
  }, []);

  const handleChange = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));
  const togglePref = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePickPhoto = () => fileInputRef.current?.click();
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile(prev => ({ ...prev, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    try {
      await api.put("/profile", {
        fullName: profile.fullName,
        email:    profile.email,
        phone:    profile.phone,
        address:  profile.address,
        bio:      profile.bio,
      });
      showToast("Your profile has been saved successfully.", "success");
    } catch {
      showToast("Failed to save profile. Please try again.", "error");
    }
  };

  const handleSavePrefs = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    reloadPrefs();
    showToast("Your preferences have been saved.", "success");
  };

  const handleChangePassword = async () => {
    if (!pwForm.current) { showToast("Please enter your current password.", "warning"); return; }
    if (pwForm.next.length < 6) { showToast("New password must be at least 6 characters.", "warning"); return; }
    if (pwForm.next !== pwForm.confirm) { showToast("New passwords do not match.", "error"); return; }
    try {
      await api.put("/auth/password", { currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwForm({ current: "", next: "", confirm: "" });
      setShowPwModal(false);
      showToast("Password updated successfully.", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password. Please try again.";
      showToast(msg, "error");
    }
  };

  const handleClearData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREFS_KEY);
    setProfile(defaultProfile);
    setPrefs(defaultPrefs);
    setShowClearConfirm(false);
    showToast("All local data has been cleared.", "info");
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast("Please enter your password to confirm account deletion.", "warning");
      return;
    }
    try {
      await api.delete("/auth/delete");
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PREFS_KEY);
      localStorage.removeItem("takipsilim_saved_sips");
      localStorage.removeItem("takipsilim_reviews");
      setShowDeleteConfirm(false);
      setDeletePassword("");
      showToast("Your account has been deleted.", "info");
      handleLogout();
    } catch {
      showToast("Incorrect password or server error. Try again.", "error");
    }
  };

  const tabs = [
    { id: "profile",     label: "Profile",     icon: "👤" },
    { id: "account",     label: "Account",     icon: "🔒" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
  ];

  return (
    <div className={`p-4 md:p-6 ${dm ? "text-[#f0e3d2]" : "text-[#2f241c]"}`}>
      <div className="max-w-3xl mx-auto space-y-5">

        <div>
          <h2 className={`text-4xl font-bold ${dm ? "text-[#d4a96a]" : "text-[#605146]"}`}>Settings</h2>
          <p className={`text-xs mt-1 ${dm ? "text-[#c8a882]" : "text-[#605146]/70"}`}>Manage your profile, account and preferences</p>
        </div>

        <div className={`flex gap-2 p-1.5 rounded-xl border ${dm ? "bg-[#2e2318] border-[#c8a882]/20" : "bg-[#e9dcc9] border-[#605146]/15"}`}>
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === t.id
                  ? "bg-[#624d2d] text-white shadow"
                  : dm ? "text-[#c8a882] hover:bg-[#3a2c20]" : "text-[#605146] hover:bg-[#605146]/10"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="space-y-4">
            <Section title="Profile Photo" icon="📷" dm={dm}>
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl border-2 overflow-hidden shrink-0 shadow-sm ${dm ? "border-[#c8a882]/30 bg-[#3a2c20]" : "border-[#605146]/30 bg-[#f0e3d2]"}`}>
                  {profile.photo
                    ? <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">👤</div>}
                </div>
                <div>
                  <p className="text-sm font-semibold">{profile.fullName || "No name set"}</p>
                  <p className="text-xs opacity-60 mt-0.5">{profile.email || "No email set"}</p>
                  <button
                    type="button"
                    onClick={handlePickPhoto}
                    className={`mt-2 text-xs font-bold underline underline-offset-2 hover:opacity-70 ${dm ? "text-[#d4a96a]" : "text-[#624d2d]"}`}
                  >
                    Change Photo
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </div>
              </div>
            </Section>

            <Section title="Personal Information" icon="📝" dm={dm}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="Full Name" dm={dm}>
                    <input type="text" value={profile.fullName} onChange={e => handleChange("fullName", e.target.value)}
                      placeholder="Juan Dela Cruz" className={getInputCls(dm)} />
                  </Field>
                </div>
                <Field label="Email Address" dm={dm}>
                  <input type="email" value={profile.email} onChange={e => handleChange("email", e.target.value)}
                    placeholder="juan@email.com" className={getInputCls(dm)} />
                </Field>
                <Field label="Phone Number" dm={dm}>
                  <input type="tel" inputMode="numeric" value={profile.phone}
                    onChange={e => handleChange("phone", e.target.value.replace(/\D/g, ""))}
                    placeholder="09XXXXXXXXX" maxLength={11} className={getInputCls(dm)} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Delivery Address" dm={dm}>
                    <textarea rows={2} value={profile.address} onChange={e => handleChange("address", e.target.value)}
                      placeholder="House No., Street, Barangay, City" className={`${getInputCls(dm)} resize-none`} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Bio (optional)" dm={dm}>
                    <textarea rows={2} value={profile.bio} onChange={e => handleChange("bio", e.target.value)}
                      placeholder="A little about yourself..." className={`${getInputCls(dm)} resize-none`} />
                  </Field>
                </div>
              </div>
              <div className={`flex justify-between items-center mt-5 pt-4 border-t ${dm ? "border-[#c8a882]/15" : "border-[#605146]/10"}`}>
                <p className="text-xs opacity-50">Saved to your account</p>
                <button type="button" onClick={handleSaveProfile}
                  className="px-8 py-2.5 rounded-xl bg-[#2f241c] text-white text-sm font-bold hover:opacity-90 active:scale-[0.98] transition">
                  Save Profile
                </button>
              </div>
            </Section>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-4">
            <Section title="Change Password" icon="🔑" dm={dm}>
              <p className={`text-sm mb-4 ${dm ? "text-[#c8a882]" : "opacity-70"}`}>Update your sign-in password. Use at least 6 characters.</p>
              <button type="button" onClick={() => setShowPwModal(true)}
                className="px-6 py-2.5 rounded-xl bg-[#605146] text-white text-sm font-bold hover:bg-[#4a3a22] transition">
                Change Password
              </button>
            </Section>

            <Section title="Danger Zone" icon="⚠️" dm={dm}>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Clear Local Data</p>
                    <p className="text-xs opacity-60 mt-0.5">Removes your saved profile and preferences from this device</p>
                  </div>
                  <button type="button" onClick={() => setShowClearConfirm(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-500 border border-red-600 text-white text-xs font-bold hover:bg-red-600 transition shrink-0">
                    Clear Data
                  </button>
                </div>
                <hr className={dm ? "border-[#c8a882]/15" : "border-[#605146]/10"} />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Sign Out</p>
                    <p className="text-xs opacity-60 mt-0.5">You will be returned to the sign-in screen</p>
                  </div>
                  <button type="button" onClick={handleLogout}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition shrink-0">
                    Sign Out
                  </button>
                </div>
                <hr className={dm ? "border-[#c8a882]/15" : "border-[#605146]/10"} />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-red-500">Delete Account</p>
                    <p className="text-xs opacity-60 mt-0.5">Permanently delete your account and all associated data</p>
                  </div>
                  <button type="button" onClick={() => setShowDeleteConfirm(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shrink-0 border-2 border-red-800">
                    Delete Account
                  </button>
                </div>
              </div>
            </Section>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-4">
            <Section title="Notifications" icon="🔔" dm={dm}>
              <div className="space-y-4">
                <Toggle checked={prefs.orderNotif} onChange={() => togglePref("orderNotif")}
                  label="Order Updates" sub="Get notified when your order status changes" dm={dm} />
                <hr className={dm ? "border-[#c8a882]/15" : "border-[#605146]/10"} />
                <Toggle checked={prefs.promoNotif} onChange={() => togglePref("promoNotif")}
                  label="Promotions & Offers" sub="Receive alerts about new deals and discounts" dm={dm} />
              </div>
            </Section>

            <Section title="Display" icon="🖥️" dm={dm}>
              <div className="space-y-4">
                <Toggle checked={prefs.darkMode} onChange={() => togglePref("darkMode")}
                  label="Dark Mode" sub="Switch to a darker color scheme" dm={dm} />
                <hr className={dm ? "border-[#c8a882]/15" : "border-[#605146]/10"} />
                <Toggle checked={prefs.compactView} onChange={() => togglePref("compactView")}
                  label="Compact View" sub="Show more items with less spacing" dm={dm} />
              </div>
            </Section>

            <div className="flex justify-end">
              <button type="button" onClick={handleSavePrefs}
                className="px-8 py-2.5 rounded-xl bg-[#2f241c] text-white text-sm font-bold hover:opacity-90 active:scale-[0.98] transition">
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>

      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-sm p-6 ${dm ? "bg-[#241c15] text-[#f0e3d2]" : "bg-white text-[#2f241c]"}`}>
            <h3 className="text-lg font-black mb-4">Change Password</h3>
            <div className="space-y-3">
              {[["current","Current Password"],["next","New Password"],["confirm","Confirm New Password"]].map(([key, label]) => (
                <div key={key}>
                  <label className={`text-xs font-bold uppercase tracking-wide block mb-1 ${dm ? "text-[#c8a882]" : "text-[#605146]/80"}`}>{label}</label>
                  <input type="password" value={pwForm[key]}
                    onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className={getInputCls(dm)} placeholder="••••••••" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => { setShowPwModal(false); setPwForm({ current:"", next:"", confirm:"" }); }}
                className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition ${dm ? "border-[#c8a882]/25 text-[#f0e3d2] hover:bg-[#3a2c20]" : "border-[#605146]/25 hover:bg-gray-50"}`}>
                Cancel
              </button>
              <button type="button" onClick={handleChangePassword}
                className="flex-1 py-2.5 rounded-xl bg-[#2f241c] text-white font-bold text-sm hover:opacity-90 transition">
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center ${dm ? "bg-[#241c15] text-[#f0e3d2]" : "bg-white text-[#2f241c]"}`}>
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-black mb-2">Clear All Data?</h3>
            <p className="text-sm opacity-60 mb-5">This will remove your saved profile and preferences from this device. This cannot be undone.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowClearConfirm(false)}
                className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition ${dm ? "border-[#c8a882]/25 text-[#f0e3d2] hover:bg-[#3a2c20]" : "border-gray-200 hover:bg-gray-50"}`}>
                Cancel
              </button>
              <button type="button" onClick={handleClearData}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition">
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-sm p-6 ${dm ? "bg-[#241c15] text-[#f0e3d2]" : "bg-white text-[#2f241c]"}`}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="text-lg font-black text-red-500">Delete Account</h3>
              <p className="text-sm opacity-60 mt-1">
                This action is <span className="font-bold text-red-500">permanent</span> and cannot be undone.
              </p>
            </div>
            <div className="mb-5">
              <label className={`text-xs font-bold uppercase tracking-wide block mb-1.5 ${dm ? "text-[#c8a882]" : "text-[#605146]/80"}`}>
                Enter your password to confirm
              </label>
              <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                placeholder="••••••••" className={`${getInputCls(dm)} border-red-400`} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); }}
                className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition ${dm ? "border-[#c8a882]/25 text-[#f0e3d2] hover:bg-[#3a2c20]" : "border-gray-200 hover:bg-gray-50"}`}>
                Cancel
              </button>
              <button type="button" onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
