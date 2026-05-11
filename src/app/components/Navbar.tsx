import { Link } from "react-router";
import { ShoppingBag, Menu } from "lucide-react";
import { useState } from "react";
import { useCart } from "../cart/CartContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white h-[72px] flex items-center border-b border-[#E8E0D5] px-6 lg:px-20">
      <div className="w-full flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-light/20 flex items-center justify-center text-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <span className="font-heading font-bold text-xl text-primary-dark">Orvella Organics</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-body text-[15px] font-medium text-text-dark">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-5">
          <Link to="/cart" className="relative text-text-dark hover:text-primary transition-colors" aria-label="View cart">
            <ShoppingBag size={20} />
            <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{count}</span>
          </Link>
          
          <a href="https://wa.me/916354726401" target="_blank" rel="noreferrer" className="text-[#25D366] hover:opacity-80 transition-opacity hidden md:flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </a>

          <button className="md:hidden text-text-dark" onClick={() => setIsOpen(!isOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>
      
      {/* Mobile Nav */}
      {isOpen && (
        <div className="absolute top-[72px] left-0 right-0 bg-white border-b border-[#E8E0D5] p-4 flex flex-col gap-4 md:hidden shadow-lg">
          <Link to="/" className="text-text-dark font-medium px-2 py-1" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/about" className="text-text-dark font-medium px-2 py-1" onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/products" className="text-text-dark font-medium px-2 py-1" onClick={() => setIsOpen(false)}>Products</Link>
          <Link to="/contact" className="text-text-dark font-medium px-2 py-1" onClick={() => setIsOpen(false)}>Contact</Link>
        </div>
      )}
    </header>
  );
}
