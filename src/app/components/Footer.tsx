import { Link } from "react-router";
import { Instagram, Facebook, Twitter } from "lucide-react";
import logoWide from "../../assets/brand/orvella-logo-wide.png";

export function Footer() {
  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2 text-white">
              <span className="inline-flex bg-white rounded-[10px] px-4 py-3">
                <img src={logoWide} alt="Orvella Organics" className="h-16 w-auto max-w-[260px] object-contain" />
              </span>
            </Link>
            <p className="text-[#E8E0D5] font-body text-sm max-w-[250px]">
              Pure. Dried. Delicious. Natural dried fruit slices made for simple everyday snacking.
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
            <Link to="/products/dried-chickoo-slices" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">Dried Chickoo Slices</Link>
            <Link to="/products/dried-black-plum-jamun-slices" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">Dried Black Plum Slices</Link>
            <Link to="/products/dried-mango-slices" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">Dried Mango Slices</Link>
            <Link to="/products/beetroot-powder" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">Beetroot Powder</Link>
            <Link to="/products" className="text-[#E8E0D5] hover:text-white text-sm font-body transition-colors">All Products</Link>
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
            <p className="text-[#E8E0D5] text-sm font-body">Email: orvellaorganics@gmail.com</p>
            <p className="text-[#E8E0D5] text-sm font-body">Phone: +91 97142 80780</p>
            <p className="text-[#E8E0D5] text-sm font-body mt-2">
              Surat, Gujarat<br />
              Pin code: 395006
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
