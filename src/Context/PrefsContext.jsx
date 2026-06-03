import { createContext, useContext, useEffect, useState } from "react";

const PREFS_KEY = "takipsilim_preferences";
const defaultPrefs = { orderNotif: true, promoNotif: false, darkMode: false, compactView: false };

const PrefsContext = createContext(null);

export const PrefsProvider = ({ children }) => {
  const [prefs, setPrefs] = useState(defaultPrefs);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) setPrefs({ ...defaultPrefs, ...JSON.parse(raw) });
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      prefs.darkMode ? "dark" : "light"
    );
  }, [prefs.darkMode]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === PREFS_KEY) {
        try {
          const raw = localStorage.getItem(PREFS_KEY);
          if (raw) setPrefs({ ...defaultPrefs, ...JSON.parse(raw) });
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const reloadPrefs = () => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) setPrefs({ ...defaultPrefs, ...JSON.parse(raw) });
    } catch {}
  };

  return (
    <PrefsContext.Provider value={{ prefs, reloadPrefs }}>
      {children}
    </PrefsContext.Provider>
  );
};

export const usePrefs = () => {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used within PrefsProvider");
  return ctx;
};
