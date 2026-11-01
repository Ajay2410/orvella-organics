import { Link, useLocation } from "react-router";
import { Menu, X, User, LogOut, ShieldCheck, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import logoWide from "../../assets/brand/orvella-logo-wide.png";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products", matchPrefix: true },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isItemActive = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.path === "/") {
      return location.pathname === "/";
    }
    if (item.matchPrefix) {
      return location.pathname.startsWith(item.path);
    }
    return location.pathname === item.path;
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Account";

  return (
    <header className="sticky top-0 z-50 bg-white h-[84px] flex items-center border-b border-[#E8E0D5] px-4 sm:px-6 lg:px-20">
      <div className="w-full flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logoWide} alt="Orvella Organics" className="h-14 sm:h-16 w-auto max-w-[190px] sm:max-w-[240px] object-contain" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-body text-[15px]">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative py-1.5 transition-colors ${
                  active
                    ? "font-semibold text-primary"
                    : "font-medium text-text-dark/75 hover:text-primary"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Icons & Auth */}
        <div className="flex items-center gap-4 sm:gap-5">
          <a
            href={`https://wa.me/919714280780?text=${encodeURIComponent("Hi Orvella Organics! 🌿 I am visiting your website and have an inquiry about your products and ordering.")}`}
            target="_blank"
            rel="noreferrer"
            className="text-[#25D366] hover:opacity-80 transition-opacity hidden md:flex items-center justify-center"
            aria-label="Contact us on WhatsApp"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </a>

          {/* User Auth Dropdown (Desktop) */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            {user ? (
              <div>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E8E0D5] bg-bg-cream/60 hover:bg-bg-cream transition-colors text-sm text-text-dark font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold uppercase">
                    {displayName.charAt(0)}
                  </div>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown size={14} className="text-text-muted" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.1)] border border-[#E8E0D5] py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-[#E8E0D5]/70">
                      <p className="text-sm font-semibold text-text-dark truncate">{displayName}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary font-medium hover:bg-bg-cream transition-colors"
                      >
                        <ShieldCheck size={16} />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-dark hover:text-primary border border-[#E8E0D5] rounded-full hover:border-primary/50 transition-colors"
              >
                <User size={16} />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-text-dark" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Navigation Menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Nav */}
      {isOpen && (
        <div className="absolute top-[84px] left-0 right-0 bg-white border-b border-[#E8E0D5] p-4 flex flex-col gap-2 md:hidden shadow-lg z-50">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-[8px] text-[15px] transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-text-dark font-medium hover:bg-bg-cream"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="pt-3 mt-1 border-t border-[#E8E0D5]/70 flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-3 py-1.5 text-xs text-text-muted">
                  Signed in as <strong className="text-text-dark">{user.email}</strong>
                  {isAdmin && (
                    <span className="ml-2 px-2 py-0.5 text-[9px] font-bold uppercase bg-amber-100 text-amber-800 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[15px] font-medium text-primary rounded-[8px] hover:bg-bg-cream"
                  >
                    <ShieldCheck size={18} />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-[15px] font-medium text-red-600 rounded-[8px] hover:bg-red-50 text-left"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-primary hover:bg-primary/90"
              >
                <User size={16} />
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
