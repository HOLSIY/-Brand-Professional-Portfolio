import React from "react";
import { motion } from "motion/react";
import Magnet from "./Magnet";
import ContactButton from "./ContactButton";
import FadeIn from "./FadeIn";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";

interface HeroSectionProps {
  onContactClick: () => void;
  onNavClick: (sectionId: string) => void;
}

export default function HeroSection({ onContactClick, onNavClick }: HeroSectionProps) {
  const handleDownloadCV = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // 1. LEFT SIDEBAR: Deep teal/green color accent
    doc.setFillColor(0, 77, 64);
    doc.rect(0, 0, 70, 297, "F");

    // LEFT COLUMN TEXT
    doc.setTextColor(255, 255, 255);
    
    // Name in Sidebar
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SENAF", 35, 25, { align: "center" });
    doc.text("WONDIMMU", 35, 34, { align: "center" });

    // Divider Line
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.line(15, 41, 55, 41);

    // Title
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("PROGRAMMER", 35, 48, { align: "center" });

    // Details Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Details", 10, 68);
    doc.line(10, 71, 60, 71);

    // Details Content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Addis Ababa", 10, 78);
    doc.text("Ethiopia", 10, 84);
    doc.text("+251974938979", 10, 90);
    doc.text("senafwondimu@gmail.com", 10, 96);

    // Skills Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Skills", 10, 115);
    doc.line(10, 118, 60, 118);

    // Skills List
    const skillsList = [
      "React",
      "HTML/Tailwind CSS",
      "Node.js",
      "Python",
      "Kotlin",
      "GitHub",
      "REST APIs"
    ];

    let currentSkillY = 125;
    skillsList.forEach((skill) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(skill, 10, currentSkillY);
      
      // Left-aligned visual efficiency indicator line (bar) showing "Excellent" proficiency
      // Background track (semi-transparent/dark teal)
      doc.setFillColor(15, 95, 80);
      doc.rect(10, currentSkillY + 1.8, 45, 1.2, "F");
      
      // Active bar (solid white for Excellent signal)
      doc.setFillColor(255, 255, 255);
      doc.rect(10, currentSkillY + 1.8, 45 * 0.94, 1.2, "F"); // 94% represents excellent signal
      
      currentSkillY += 9;
    });

    // Links Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Links", 10, 195);
    doc.line(10, 198, 60, 198);

    // Links Content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5); // Slightly smaller to fit longer linkedin URL perfectly
    doc.text("linkedin.com/in/senaf-wondimmu-a6266741b", 10, 204);
    doc.setFontSize(9);
    doc.text("github.com/HOLSIY", 10, 211);

    // Languages Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Languages", 10, 225);
    doc.line(10, 228, 60, 228);

    // Languages Content
    const languages = ["English", "Amharic", "Afaan Oromo"];
    const langProficiency = [0.90, 0.95, 0.92]; // High frequency proficiency
    let langY = 236;
    languages.forEach((lang, i) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(lang, 10, langY);
      
      // Left-aligned performance frequency bar
      doc.setFillColor(15, 95, 80);
      doc.rect(10, langY + 1.8, 45, 1.2, "F");
      
      doc.setFillColor(255, 255, 255);
      doc.rect(10, langY + 1.8, 45 * langProficiency[i], 1.2, "F");
      
      langY += 9;
    });


    // 2. RIGHT CONTENT AREA
    doc.setTextColor(30, 41, 59);

    // Professional Summary Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Professional Summary", 80, 25);
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.line(80, 28, 200, 28);

    // Professional Summary Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const summaryText = "Developer and creator passionate about building modern web and mobile applications. A creative thinker, adept in software development and working with various data structures.";
    const splitSummary = doc.splitTextToSize(summaryText, 115);
    doc.text(splitSummary, 80, 35);

    // Academic & Project Experience Heading (formerly Employment History)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Academic & Project Experience", 80, 55);
    doc.line(80, 58, 200, 58);

    // Employment Detail
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Developer & Creator", 80, 65);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const employmentDesc = "Experienced in building responsive web applications and Android apps, delivering clean, maintainable code and user-centered designs.";
    const splitEmpDesc = doc.splitTextToSize(employmentDesc, 115);
    doc.text(splitEmpDesc, 80, 71);

    // Bullet Points
    const experienceBullets = [
      "Designed and implemented front-end interfaces using React, HTML5 and CSS3 to create responsive, accessible UIs.",
      "Developed RESTful back-end services with Node.js and Python; integrated APIs and databases to support dynamic functionality.",
      "Built Android applications using Kotlin, Android Studio and Jetpack Compose, focusing on performance and intuitive UX.",
      "Applied best practices including Git-based version control, modular architecture, code reviews and automated testing to improve reliability and maintainability.",
      "Passionate about applying UI/UX principles and modern technologies to turn ideas into practical digital products."
    ];

    let bulletY = 85;
    experienceBullets.forEach((bullet) => {
      // Draw small bullet point symbol
      doc.setFont("helvetica", "bold");
      doc.text("*", 82, bulletY + 1.5);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const splitBullet = doc.splitTextToSize(bullet, 110);
      doc.text(splitBullet, 86, bulletY + 1);
      bulletY += (splitBullet.length * 4.5) + 3;
    });

    // Education Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Education", 80, 160);
    doc.line(80, 163, 200, 163);

    // Education Content
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Bachelor of Science in Software Engineering (Ongoing)", 80, 170);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.text("Bule Hora University | Expected Graduation: 2028", 80, 175);

    // Projects Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Project", 80, 192);
    doc.line(80, 195, 200, 195);

    // Projects Content
    const projectsList = [
      { name: "Chat App", desc: "Built real-time messaging app using Node.js and WebSocket." },
      { name: "File Encryption App", desc: "Developed secure file encryption system for protecting user data." },
      { name: "Solaris", desc: "Designed modern responsive UI with animations and 3D-style layout." }
    ];

    let projectY = 202;
    projectsList.forEach((proj) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(`- ${proj.name}`, 80, projectY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const splitProjDesc = doc.splitTextToSize(proj.desc, 110);
      doc.text(splitProjDesc, 84, projectY + 4.5);
      
      projectY += (splitProjDesc.length * 4.5) + 6;
    });

    // Save and Trigger download
    doc.save("Senaf_Wondimmu_CV.pdf");
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
