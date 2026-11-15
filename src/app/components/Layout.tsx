import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";
import { AuthProvider } from "../../context/AuthContext";
import { CartProvider } from "../../context/CartContext";
import { AuthModal } from "./auth/AuthModal";
import { CartDrawer } from "./cart/CartDrawer";

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when the route changes
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen relative">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <WhatsAppButton />
          <AuthModal />
          <CartDrawer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
