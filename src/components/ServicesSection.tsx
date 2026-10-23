import React from "react";
import FadeIn from "./FadeIn";
import { Cpu, Layout, Smartphone, PenTool, CheckCircle2 } from "lucide-react";

export default function ServicesSection() {
  const serviceItems = [
    {
      num: "01",
      name: "Web Development",
      desc: "Creation of clean, modern, responsive websites and high-performance, interactive frontends using cutting-edge technologies like React.",
    },
    {
      num: "02",
      name: "Mobile Application",
      desc: "Building robust, native, and cross-platform mobile apps with sleek user interfaces and seamless performance.",
    },
    {
      num: "03",
      name: "Motion Design",
      desc: "Dynamic animations and motion graphics that add energy and storytelling to brands, products, and digital experiences.",
    },
    {
      num: "04",
      name: "Branding",
      desc: "Crafting cohesive visual identities -- from logos to full brand systems -- that communicate a clear and memorable presence.",
    },
    {
      num: "05",
      name: "Rendering",
      desc: "High-quality, photorealistic renders that showcase designs with custom lighting, textures, and materials to bring concepts to life.",
    },
  ];

  // For Developer Portfolio
  const devSkills = [
    {
      title: "Frontend Development",
      description: "Crafting highly responsive, interactive, and visually stunning web user interfaces.",
      tags: ["React", "HTML5/CSS3", "JavaScript", "Tailwind CSS"],
      icon: Layout,
    },
    {
      title: "Backend Development",
      description: "Designing secure, modular API systems, relational and document databases.",
      tags: ["Node.js", "Express", "Python", "RESTful APIs"],
      icon: Cpu,
    },
    {
      title: "Mobile App Development",
      description: "Building fast, native, and scalable mobile apps with beautiful interfaces.",
      tags: ["Kotlin", "Android Studio", "Jetpack Compose"],
      icon: Smartphone,
    },
    {
      title: "UI/UX Design Basics",
      description: "Focusing on visual hierarchies, color theories, typography and micro-interactions.",
      tags: ["Figma", "Wireframing", "Prototyping", "Kanit Font"],
      icon: PenTool,
    },
  ];

  const valueOfferings = [
    { title: "Website Development", desc: "Pixel-perfect conversion of designs to robust, working code." },
    { title: "Mobile App Development", desc: "Native Kotlin mobile applications with seamless user journeys." },
    { title: "UI Design", desc: "Prototyping clean, high-fidelity landing pages and application wireframes." },
    { title: "Bug Fixing & Optimization", desc: "Enhancing performance, responsiveness, and squashing legacy issues." },
  ];

  return (
    <section
      id="services"
      className="bg-[#FFFFFF] text-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 flex flex-col items-center relative z-20"
    >
      <div className="max-w-5xl w-full">
        {/* Heading */}
        <FadeIn delay={0} y={40} duration={0.8} className="text-center w-full">
          <h2 className="font-black uppercase tracking-tight text-center text-5xl sm:text-7xl md:text-8xl lg:text-9xl mb-16 sm:mb-20 md:mb-28 text-[#0C0C0C]">
            Services
          </h2>
        </FadeIn>

        {/* 1. 3D & Design Services Vertical List */}
        <div className="flex flex-col mb-24 sm:mb-32">
          {serviceItems.map((item, i) => (
            <FadeIn
              key={item.num}
              delay={i * 0.1}
              y={30}
              duration={0.8}
              className="border-b border-[#0C0C0C]/15 last:border-b-0 py-8 sm:py-10 md:py-12"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Left Number */}
                <span className="font-black leading-none text-6xl sm:text-8xl md:text-[8rem] lg:text-[9rem] text-[#0C0C0C] opacity-100 select-none">
                  {item.num}
                </span>

                {/* Right Text */}
                <div className="flex-1 md:ml-12 lg:ml-20">
                  <h3 className="font-medium uppercase text-xl sm:text-2xl md:text-3xl text-[#0C0C0C] mb-3">
                    {item.name}
                  </h3>
                  <p className="font-light leading-relaxed max-w-2xl text-sm sm:text-base md:text-lg text-[#0C0C0C]/75">
                    {item.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#0C0C0C]/10 w-full my-12" />

        {/* 2. Developer Capabilities Bento Grid */}
        <div className="mt-12 w-full">
          <FadeIn delay={0} y={30} duration={0.8} className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-[#0C0C0C]/40 block mb-2">Technical Core</span>
            <h3 className="text-2xl sm:text-4xl font-black uppercase text-[#0C0C0C] tracking-tight">
              Developer Skills & Tech Stack
            </h3>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {devSkills.map((skill, index) => {
              const IconComponent = skill.icon;
              return (
                <FadeIn
                  key={skill.title}
                  delay={index * 0.1}
                  y={30}
                  duration={0.8}
                  className="bg-[#0C0C0C]/5 rounded-[30px] p-6 sm:p-8 hover:bg-[#0C0C0C]/10 transition-all duration-300 border border-[#0C0C0C]/5"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#0C0C0C] text-white rounded-2xl flex-shrink-0">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg sm:text-xl uppercase tracking-wide text-[#0C0C0C] mb-2">
                        {skill.title}
                      </h4>
                      <p className="text-sm sm:text-base text-[#0C0C0C]/70 mb-4 font-light leading-relaxed">
                        {skill.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skill.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-[#0C0C0C] text-white text-xs px-3 py-1 rounded-full font-medium tech-tag"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#0C0C0C]/10 w-full my-16" />

        {/* 3. Value-add Development Offerings */}
        <div className="mt-12 w-full">
          <FadeIn delay={0} y={30} duration={0.8} className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-[#0C0C0C]/40 block mb-2">Execution Quality</span>
            <h3 className="text-2xl sm:text-4xl font-black uppercase text-[#0C0C0C] tracking-tight">
              How I Can Help Your Project
            </h3>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {valueOfferings.map((offering, index) => (
              <FadeIn
                key={offering.title}
                delay={index * 0.1}
                y={30}
                duration={0.8}
                className="bg-[#0C0C0C]/5 rounded-[24px] p-6 flex flex-col justify-between border border-[#0C0C0C]/5 hover:scale-[1.02] transition-transform duration-300"
              >
                <div>
                  <CheckCircle2 className="w-8 h-8 text-[#0C0C0C] mb-4 opacity-80" />
                  <h4 className="font-bold uppercase text-sm sm:text-base text-[#0C0C0C] mb-2">
                    {offering.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#0C0C0C]/75 font-light leading-relaxed">
                    {offering.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
