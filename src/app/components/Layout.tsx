import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when the route changes
    if (typeof window !== 'undefined') {
      // Use instant for regular nav and smooth for link clicks
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
