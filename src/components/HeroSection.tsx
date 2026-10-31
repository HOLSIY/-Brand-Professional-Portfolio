import React from "react";
import { motion } from "motion/react";
import Magnet from "./Magnet";
import ContactButton from "./ContactButton";
import FadeIn from "./FadeIn";
import { Download } from "lucide-react";
import { downloadCV } from "../utils/generateCV";

interface HeroSectionProps {
  onContactClick: () => void;
  onNavClick: (sectionId: string) => void;
}

export default function HeroSection({ onContactClick, onNavClick }: HeroSectionProps) {
  const handleDownloadCV = () => {
    downloadCV();
  };

  return (
    <section className="relative h-screen min-h-[600px] flex flex-col justify-between overflow-x-clip bg-transparent">
      {/* 1. NAVBAR */}
      <FadeIn delay={0} y={-20} duration={0.8} className="z-30">
        <nav className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8 w-full">
          {/* Logo / Brand */}
          <button 
            onClick={() => onNavClick("hero")}
            className="text-lg md:text-2xl font-black tracking-tighter text-white uppercase hover:opacity-75 transition-opacity cursor-pointer"
          >
            Senaf.
          </button>
          
          {/* Nav Links */}
          <div className="flex gap-4 sm:gap-6 md:gap-10 lg:gap-14">
            {[
              { id: "about", label: "About" },
              { id: "services", label: "Services" }, // "Price" maps to Services/Price section
              { id: "projects", label: "Projects" },
              { id: "contact", label: "Contact" },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => onNavClick(link.id)}
                className="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm md:text-lg lg:text-[1.4rem] hover:opacity-70 transition-opacity duration-200 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>
        </nav>
      </FadeIn>

      {/* 2. PORTRAIT (Removed as requested) */}

      {/* 3. HERO HEADING & SUBTITLE */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-10 z-20 pointer-events-none select-none">
        <div className="overflow-visible w-full text-center sm:text-left mt-16 sm:mt-8 md:-mt-5">
          <FadeIn delay={0.15} y={40} duration={0.8} className="w-full">
            <h1 className="hero-heading font-black uppercase tracking-tight leading-none whitespace-nowrap w-full text-[11vw] sm:text-[12vw] md:text-[12.5vw] lg:text-[13vw] pr-[2.5vw] overflow-visible">
              Hi, <span className="tracking-wide">i&apos;m</span> senaf
            </h1>
          </FadeIn>
        </div>
      </div>

      {/* 4. BOTTOM BAR */}
      <div className="px-6 md:px-10 pb-7 sm:pb-8 md:pb-10 flex justify-between items-end z-20 w-full gap-4">
        {/* Left Subtext replaced with Download CV button */}
        <FadeIn delay={0.35} y={20} duration={0.8} className="text-left">
          <button
            onClick={handleDownloadCV}
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-5 py-4 rounded-2xl font-semibold tracking-wide text-xs sm:text-sm uppercase transition-all duration-300 shadow-sm cursor-pointer"
          >
            <Download className="w-5 h-5 text-white/80" />
            <span>Download CV</span>
          </button>
        </FadeIn>

        {/* Right Button */}
        <FadeIn delay={0.5} y={20} duration={0.8} className="text-right">
          <ContactButton 
            onClick={onContactClick} 
            label="Hire Me" 
            className="shadow-lg"
          />
        </FadeIn>
      </div>
    </section>
  );
}
