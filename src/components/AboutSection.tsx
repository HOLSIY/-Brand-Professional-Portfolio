import React from "react";
import FadeIn from "./FadeIn";
import AnimatedText from "./AnimatedText";
import ContactButton from "./ContactButton";
import LazyImage from "./LazyImage";
import senafProfile from "../assets/images/regenerated_image_1783182542165.webp";
import { motion } from "motion/react";

interface AboutSectionProps {
  onContactClick: () => void;
}

export default function AboutSection({ onContactClick }: AboutSectionProps) {
  const bioText = "I'm Senaf Wondimu, a professional developer and creator passionate about crafting high-quality digital solutions. I specialize in modern web design, full-stack web development, and Kotlin Android applications. With a strong foundation in scalable architecture and polished UI/UX principles, I build clean, high-performance products that bring creative visions to life.";

  return (
    <section id="about" className="relative min-h-screen bg-transparent px-5 sm:px-8 md:px-10 py-24 sm:py-32 flex flex-col justify-center items-center overflow-hidden">
      
      {/* Absolute Decorative 3D Images in Corners */}
      {/* Top-Left: Moon icon */}
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute top-[2%] left-[2%] sm:top-[4%] sm:left-[2%] md:left-[4%] z-0 select-none pointer-events-none"
      >
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png"
          alt="Decorative Moon"
          loading="lazy"
          decoding="async"
          className="w-[50px] sm:w-[80px] md:w-[120px] lg:w-[150px] xl:w-[180px] h-auto object-contain opacity-30 sm:opacity-50 md:opacity-70 xl:opacity-80"
        />
      </FadeIn>

      {/* Bottom-Left: 3D Object */}
      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute bottom-[2%] left-[2%] sm:bottom-[4%] sm:left-[2%] md:left-[4%] z-0 select-none pointer-events-none"
      >
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png"
          alt="Decorative Shape"
          loading="lazy"
          decoding="async"
          className="w-[40px] sm:w-[70px] md:w-[100px] lg:w-[120px] xl:w-[140px] h-auto object-contain opacity-30 sm:opacity-50 md:opacity-70 xl:opacity-80"
        />
      </FadeIn>

      {/* Top-Right: Lego icon (Smile Emoji) */}
      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="absolute top-[2%] right-[2%] sm:top-[4%] sm:right-[2%] md:right-[4%] z-0 select-none pointer-events-none"
      >
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png"
          alt="Decorative Lego"
          loading="lazy"
          decoding="async"
          className="w-[50px] sm:w-[80px] md:w-[120px] lg:w-[150px] xl:w-[180px] h-auto object-contain opacity-30 sm:opacity-50 md:opacity-70 xl:opacity-80"
        />
      </FadeIn>

      {/* Bottom-Right: 3D Group */}
      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="absolute bottom-[2%] right-[2%] sm:bottom-[4%] sm:right-[2%] md:right-[4%] z-0 select-none pointer-events-none"
      >
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png"
          alt="Decorative Composition"
          loading="lazy"
          decoding="async"
          className="w-[50px] sm:w-[80px] md:w-[110px] lg:w-[145px] xl:w-[175px] h-auto object-contain opacity-30 sm:opacity-50 md:opacity-70 xl:opacity-80"
        />
      </FadeIn>

      {/* Content Container */}
      <div className="flex flex-col items-center justify-center w-full max-w-5xl z-20">
        {/* Heading */}
        <FadeIn delay={0} y={40} duration={0.8}>
          <h2 className="hero-heading font-black uppercase leading-none tracking-tight text-center text-4xl sm:text-6xl md:text-8xl lg:text-9xl mb-12 sm:mb-16 md:mb-20">
            About me
          </h2>
        </FadeIn>

        {/* Split Grid for Profile Picture & Text */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-16 items-center w-full">
          {/* Profile Picture Frame */}
          <div className="col-span-1 md:col-span-5 flex justify-center -mt-6 md:-mt-12 md:mb-0 mb-6">
            <FadeIn delay={0.15} x={-40} y={0} duration={0.8} className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-[310px] lg:max-w-[330px]">
              <motion.div
                whileHover={{ scale: 1.02, rotate: -1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group aspect-square rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 shadow-2xl bg-white/5 p-2 transition-all duration-300"
              >
                {/* Neon Glow Backlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#B600A8]/20 to-[#7621B0]/20 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 rounded-3xl -z-10" />
                
                {/* Border effect overlay */}
                <div className="absolute inset-0 border border-white/5 group-hover:border-white/20 transition-all duration-500 rounded-[22px] pointer-events-none z-10" />

                {/* Profile Image with Lazy Loading */}
                <LazyImage
                  src={senafProfile}
                  alt="Senaf Wondimmu"
                  className="w-full h-full object-cover rounded-2xl filter brightness-95 group-hover:brightness-100 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </FadeIn>
          </div>

          {/* Bio Text & Action */}
          <div className="col-span-1 md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="max-w-xl md:max-w-none mb-10 md:mb-12">
              <AnimatedText
                text={bioText}
                className="text-[#D7E2EA] font-medium leading-relaxed font-sans text-sm sm:text-base md:text-lg lg:text-xl text-center md:text-left"
              />
            </div>

            {/* Hire Me Button */}
            <FadeIn delay={0.3} y={30} duration={0.8}>
              <ContactButton onClick={onContactClick} label="Hire Me" />
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
