import { useState } from "react";
import { useAuth } from "./Context/useAuth";
import { CartProvider } from "./Context/useCart";
import { ToastProvider } from "./Context/ToastContext";
import { PrefsProvider, usePrefs } from "./Context/PrefsContext";
import { ReviewProvider } from "./Context/ReviewContext";
import { Navbar } from "./Components/Navbar";
import { Content } from "./Components/Content";
import { Footer } from "./Components/Footer";
import { SignIn } from "./Components/SignIn";
import "./App.css";

function AppInner() {
  const { user, addOrderCount, loading } = useAuth();
  const { prefs } = usePrefs();
  const [activeLink, setActiveLink] = useState("Home");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8d9c4]">
        <div className="text-[#605146] text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <CartProvider key={user?.username ?? "guest"} onOrderPlaced={() => user && addOrderCount(user.username)}>
      <ToastProvider>
        <div className="min-h-screen flex flex-col">
          {!user ? (
            <>
              <main className="flex-1">
                <SignIn />
              </main>
              <Footer className="mt-0" />
            </>
          ) : (
            <>
              <Navbar activeLink={activeLink} setActiveLink={setActiveLink} />
              <main className="flex-1">
                <Content activeLink={activeLink} setActiveLink={setActiveLink} />
              </main>
              <Footer />
            </>
          )}
        </div>
      </ToastProvider>
    </CartProvider>
  );
}

function App() {
  return (
    <PrefsProvider>
      <ReviewProvider>
        <AppInner />
      </ReviewProvider>
    </PrefsProvider>
  );
}

export default App;