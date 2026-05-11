import { Link } from "react-router";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                </svg>
              </div>
              <span className="font-heading font-bold text-xl tracking-wide">Orvella Organics</span>
            </Link>
            <p className="text-[#E8E0D5] font-body text-sm max-w-[250px]">
              Pure. Dried. Delicious. Premium dehydrated fruits & B12 wellness — snack smarter, live better.
            </p>
            <div className="flex items-center gap-4 text-[#E8E0D5]">
              <a href="#" className="hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Products */}
          <div className="flex flex-col gap-4">
            <h4 className="font-heading font-bold text-lg text-peach mb-2">Shop</h4>
            <Link to="/products/mango" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">Dehydrated Mango</Link>
            <Link to="/products/apple" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">Dehydrated Apple</Link>
            <Link to="/products/chikoo" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">Dehydrated Chikoo</Link>
            <Link to="/products/jamun" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">Dehydrated Jamun</Link>
            <Link to="/products/b12-powder" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">B12 Wellness Powder</Link>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-heading font-bold text-lg text-peach mb-2">Quick Links</h4>
            <Link to="/about" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">Our Story</Link>
            <Link to="/products" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">All Products</Link>
            <Link to="/contact" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">Contact Us</Link>
            <a href="#" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">FAQs</a>
            <a href="#" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">Shipping & Returns</a>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h4 className="font-heading font-bold text-lg text-peach mb-2">Contact</h4>
            <p className="text-[#E8E0D5] text-sm font-body">Email: hello@orvellaorganics.com</p>
            <p className="text-[#E8E0D5] text-sm font-body">Phone: +91 97142 80780</p>
            <p className="text-[#E8E0D5] text-sm font-body mt-2">
              123 Organic Lane, Green Valley<br />
              Mumbai, Maharashtra 400001
            </p>
          </div>
          
        </div>

        <div className="border-t border-[#3E5C4E] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9BB1A5] font-body">
          <p>© {new Date().getFullYear()} Orvella Organics. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
