import { Mail, Phone, MapPin, Clock } from "lucide-react";

export function Contact() {
  return (
    <div className="py-24 px-6 lg:px-20 bg-bg-cream min-h-screen">
      <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-16 items-start">
        
        {/* Left: Contact Form */}
        <div className="bg-white p-8 lg:p-12 rounded-[24px] shadow-[0_2px_16px_rgba(0,0,0,0.05)] border border-[#E8E0D5]/50">
          <h1 className="font-heading font-bold text-4xl text-text-dark mb-8">Get in Touch</h1>
          
          <form className="flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="font-body text-sm font-medium text-text-dark">Full Name</label>
              <input 
                type="text" 
                id="name" 
                placeholder="John Doe" 
                className="px-5 py-3.5 rounded-[12px] border border-[#E8E0D5] bg-bg-cream focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body"
                required
              />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-body text-sm font-medium text-text-dark">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="john@example.com" 
                  className="px-5 py-3.5 rounded-[12px] border border-[#E8E0D5] bg-bg-cream focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="font-body text-sm font-medium text-text-dark">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  placeholder="+91 97142 80780" 
                  className="px-5 py-3.5 rounded-[12px] border border-[#E8E0D5] bg-bg-cream focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="font-body text-sm font-medium text-text-dark">Message</label>
              <textarea 
                id="message" 
                rows={5} 
                placeholder="How can we help you?" 
                className="px-5 py-3.5 rounded-[12px] border border-[#E8E0D5] bg-bg-cream focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body resize-none"
                required
              ></textarea>
            </div>
            
            <button type="submit" className="bg-primary text-white py-4 rounded-[12px] font-body font-bold text-lg hover:bg-primary-dark transition-colors mt-2 shadow-lg shadow-primary/20">
              Send Message
            </button>
          </form>
        </div>

        {/* Right: Contact Info */}
        <div className="flex flex-col gap-10">
          <div>
            <h2 className="font-heading font-bold text-3xl text-text-dark mb-6">We'd Love to Hear From You</h2>
            <p className="font-body text-text-muted text-lg leading-relaxed">
              Whether you have a question about our products, shipping, or anything else, our team is ready to answer all your questions.
            </p>
          </div>

          <div className="flex flex-col gap-6 bg-white p-8 rounded-[24px] shadow-[0_2px_16px_rgba(0,0,0,0.05)] border border-[#E8E0D5]/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg text-text-dark">WhatsApp Support</span>
                <span className="font-body text-text-muted">+91 97142 80780</span>
                <a href="https://wa.me/916354726401" target="_blank" rel="noreferrer" className="text-[#25D366] font-medium text-sm mt-1 hover:underline">Chat with us</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <Mail size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg text-text-dark">Email Us</span>
                <span className="font-body text-text-muted">hello@orvellaorganics.com</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <MapPin size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg text-text-dark">Office Location</span>
                <span className="font-body text-text-muted">123 Organic Lane, Green Valley<br/>Mumbai, Maharashtra 400001</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <Clock size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg text-text-dark">Business Hours</span>
                <span className="font-body text-text-muted">Monday - Friday: 9:00 AM - 6:00 PM<br/>Saturday: 10:00 AM - 2:00 PM</span>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="w-full h-64 bg-[#E8E0D5] rounded-[24px] overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading font-bold text-text-muted">Map View Disabled in Preview</span>
            </div>
            {/* Real map iframe goes here in production */}
          </div>
          
        </div>
      </div>
    </div>
  );
}
