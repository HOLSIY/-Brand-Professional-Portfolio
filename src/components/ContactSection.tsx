import React, { useState } from "react";
import FadeIn from "./FadeIn";
import { Send, Github, Linkedin, MessageSquare, Mail, User, MessageCircle, AlertCircle, CheckCircle2, Instagram, Facebook } from "lucide-react";

export default function ContactSection({ onAdminClick }: { onAdminClick?: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [secretClickTimestamps, setSecretClickTimestamps] = useState<number[]>([]);

  const handleSecretClick = () => {
    const now = Date.now();
    setSecretClickTimestamps((prev) => {
      // Keep only clicks within the last 13 seconds (13000 milliseconds)
      const recent = prev.filter((time) => now - time <= 13000);
      const updated = [...recent, now];
      if (updated.length >= 12) {
        if (onAdminClick) {
          onAdminClick();
        } else {
          window.location.hash = "#mulu-private-dashboard-72x9";
        }
        return [];
      }
      return updated;
    });
  };

  const getFirstName = () => {
    if (!formData.name) return "";
    const trimName = formData.name.trim();
    const spaceIndex = trimName.indexOf(" ");
    return spaceIndex === -1 ? trimName : trimName.substring(0, spaceIndex);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // Handle non-JSON responses (e.g. HTML error pages) gracefully
        const text = await response.text();
        const cleanText = text.replace(/<[^>]*>/g, '').substring(0, 150).trim();
        throw new Error(
          cleanText 
            ? `Server Error (${response.status}): ${cleanText}...` 
            : `Failed to submit form (Server Status ${response.status}). Please try again later.`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form. Please try again.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", message: "" });
    setIsSubmitted(false);
  };

  return (
    <section
      id="contact"
      className="bg-[#0C0C0C] text-[#D7E2EA] px-6 md:px-10 py-24 md:py-32 flex flex-col items-center relative z-40 overflow-hidden border-t border-[#D7E2EA]/5"
    >
      {/* Neon glowing decorative gradients */}
      <div className="absolute -top-[10%] -left-[10%] w-[300px] h-[300px] rounded-full bg-[#B600A8]/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[350px] h-[350px] rounded-full bg-[#7621B0]/15 blur-[150px] pointer-events-none" />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
        {/* Left Column: Info & Links */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full gap-8">
          <div>
            <FadeIn delay={0} y={30} duration={0.8}>
              <span className="text-xs uppercase tracking-widest font-bold text-[#D7E2EA]/40 block mb-2">Let&apos;s Connect</span>
              <h2 className="hero-heading font-black uppercase text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none mb-6">
                Start a project
              </h2>
            </FadeIn>

            <FadeIn delay={0.15} y={30} duration={0.8}>
              <p className="text-[#D7E2EA]/70 font-light leading-relaxed text-sm sm:text-base mb-8">
                Whether you need custom modeling, highly scalable React web applications, or a native Kotlin app, let&apos;s collaborate to build something stunning.
              </p>
            </FadeIn>

            {/* Direct Connect Options */}
            <div className="flex flex-col gap-4">
              {/* WhatsApp Button */}
              <FadeIn delay={0.25} y={20} duration={0.8}>
                <a
                  href="https://wa.me/251974938979"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] px-5 py-4 rounded-2xl font-semibold tracking-wide text-sm transition-all duration-300 w-full sm:w-auto shadow-sm"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span className="uppercase tracking-wider">Chat on WhatsApp</span>
                </a>
              </FadeIn>

              {/* Email Address */}
              <FadeIn delay={0.3} y={20} duration={0.8}>
                <a
                  href="mailto:senafwondimu@gmail.com"
                  className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-4 rounded-2xl font-medium tracking-wide text-sm transition-all duration-300 w-full sm:w-auto"
                >
                  <Mail className="w-5 h-5 text-[#D7E2EA]/70" />
                  <span className="tracking-wide">senafwondimu@gmail.com</span>
                </a>
              </FadeIn>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <FadeIn delay={0.35} y={20} duration={0.8} className="flex gap-4">
              <a
                href="https://github.com/HOLSIY"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full transition-all duration-300 hover:scale-110"
                aria-label="GitHub Profile"
              >
                <Github className="w-6 h-6" />
              </a>

              <a
                href="https://www.linkedin.com/in/senaf-wondimmu-a6266741b/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full transition-all duration-300 hover:scale-110"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-6 h-6" />
              </a>

              <a
                href="https://www.instagram.com/senaf_21/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-[#FF007F] hover:text-white rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Instagram Profile"
              >
                <Instagram className="w-6 h-6" />
              </a>

              <a
                href="https://www.facebook.com/mikyo.liza.1"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-[#1877F2] hover:text-white rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Facebook Profile"
              >
                <Facebook className="w-6 h-6" />
              </a>
            </FadeIn>
          </div>
        </div>

        {/* Right Column: Email Form (Glassmorphism & Neon Accent) */}
        <div className="lg:col-span-7 w-full">
          <FadeIn delay={0.1} y={30} duration={0.9} className="w-full">
            <div className="w-full bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative">
              
              {/* Form submit states */}
              {isSubmitted ? (
                <div className="py-12 text-center flex flex-col items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Thanks, {getFirstName()}!</h3>
                    <p className="text-sm sm:text-base text-[#D7E2EA]/70 max-w-sm">
                      Your message has been sent successfully. I will review it and reply as soon as possible.
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="mt-4 text-[#D7E2EA] border border-white/10 hover:bg-white/5 px-6 py-2.5 rounded-full text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">Email Me</h3>
                    <p className="text-xs sm:text-sm text-[#D7E2EA]/50 font-light">Fill out this quick form and I&apos;ll be in touch.</p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-3 rounded-xl text-sm font-medium">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Name Input */}
                  <div className="flex flex-col gap-2 relative">
                    <label htmlFor="name" className="text-xs uppercase tracking-wider text-[#D7E2EA]/70 font-medium">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-[#0C0C0C] border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-3.5 pl-12 pr-4 text-sm transition-all duration-300 outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-2 relative">
                    <label htmlFor="email" className="text-xs uppercase tracking-wider text-[#D7E2EA]/70 font-medium">
                      Your Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-[#0C0C0C] border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-3.5 pl-12 pr-4 text-sm transition-all duration-300 outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="flex flex-col gap-2 relative">
                    <label htmlFor="message" className="text-xs uppercase tracking-wider text-[#D7E2EA]/70 font-medium">
                      Your Message
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-white/30" />
                      <textarea
                        id="message"
                        rows={4}
                        placeholder="Tell me about your project or idea..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-[#0C0C0C] border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-3.5 pl-12 pr-4 text-sm transition-all duration-300 outline-none placeholder:text-white/20 resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSending}
                    className="relative rounded-full text-white font-semibold uppercase tracking-widest hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer py-4 text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-55 disabled:scale-100 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
                      boxShadow: "0px 4px 4px rgba(181, 1, 167, 0.25), inset 4px 4px 12px #7721B1",
                      outline: "2px solid white",
                      outlineOffset: "-3px",
                    }}
                  >
                    <span>{isSending ? "Sending Message..." : "Send Message"}</span>
                    <Send className={`w-4 h-4 ${isSending ? "animate-pulse" : ""}`} />
                  </button>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Footer Branding Credit */}
      <div className="mt-24 text-center border-t border-white/5 pt-8 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-[#D7E2EA]/70 font-semibold tracking-wide">
        <p 
          className="cursor-default select-none hover:text-slate-400 active:scale-95 transition-all duration-300"
          onClick={handleSecretClick}
          title="Designed & Developed by Senaf"
        >
          © 2026 Senaf Wondimmu. All rights reserved.
        </p>
      </div>
    </section>
  );
}
