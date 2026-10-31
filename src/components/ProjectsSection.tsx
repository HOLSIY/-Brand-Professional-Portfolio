import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Github } from "lucide-react";
import FadeIn from "./FadeIn";
import LiveProjectButton from "./LiveProjectButton";

// Import project images (ultra-optimized WebP assets for instant loading)
import p1_col1_1 from "../assets/images/p1_col1_1.webp";
import p1_col1_2 from "../assets/images/p1_col1_2.webp";
import p1_col2 from "../assets/images/p1_col2.webp";

import p2_col1_1 from "../assets/images/p2_col1_1.webp";
import p2_col1_2 from "../assets/images/p2_col1_2.webp";
import p2_col2 from "../assets/images/p2_col2.webp";

import p3_col1_1 from "../assets/images/p3_col1_1.webp";
import p3_col1_2 from "../assets/images/p3_col1_2.webp";
import p3_col2 from "../assets/images/p3_col2.webp";

// Global cache tracking URLs that have loaded in this session to prevent re-downloads or flicker
import { loadedImageUrls } from "./LazyImage";

export interface ProjectData {
  id?: string;
  num: string;
  category: string;
  title: string;
  description?: string;
  col1_1: string;
  col1_2: string;
  col2: string;
  liveUrl?: string;
  githubUrl?: string;
}

export const DEFAULT_PROJECTS: ProjectData[] = [
  {
    num: "01",
    category: "RESTAURANT / ONLINE ORDERING",
    title: "Village Cafe",
    description: "A modern restaurant website for menus and online orders.",
    col1_1: p1_col1_1,
    col1_2: p1_col1_2,
    col2: p1_col2,
    liveUrl: "https://village-restaurant-delta.vercel.app/",
    githubUrl: "https://github.com/HOLSIY/Village-Restaurant.git",
  },
  {
    num: "02",
    category: "SOCIAL MEDIA / COMMUNITY CONNECTION",
    title: "Got U — Social Media Platform",
    description: "A social platform for sharing, connecting, and engaging.",
    col1_1: p2_col1_1,
    col1_2: p2_col1_2,
    col2: p2_col2,
    githubUrl: "https://github.com/HOLSIY/got-u",
  },
  {
    num: "03",
    category: "PUBLIC RECRUITMENT / TRANSPARENCY",
    title: "EthioMerit — Public Recruitment & Anti-Corruption Platform",
    description: "Promoting fair hiring and transparent recruitment.",
    col1_1: p3_col1_1,
    col1_2: p3_col1_2,
    col2: p3_col2,
    githubUrl: "https://github.com/HOLSIY/EthioMerit---Public-Recruitment-Anti-Corruption-Platform",
  },
];

/* Helper Component: Renders an image using viewport lazy loading and browser caching */
function ImageWithLoader({
  src,
  alt,
  className = "",
  whileHover,
  transition,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  whileHover?: any;
  transition?: any;
  [key: string]: any;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isAlreadyLoaded = loadedImageUrls.has(src);
  const [inView, setInView] = useState(isAlreadyLoaded);
  const [isLoaded, setIsLoaded] = useState(isAlreadyLoaded);

  useEffect(() => {
    if (isAlreadyLoaded) {
      setInView(true);
      setIsLoaded(true);
      return;
    }
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "350px 100px", threshold: 0.01 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [src, isAlreadyLoaded]);

  // Handle cached images where complete is true before or upon mount
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      loadedImageUrls.add(src);
      setIsLoaded(true);
    }
  }, [inView, src]);

  const hasObjectFit = className.includes("object-contain") || className.includes("object-cover");
  const defaultClasses = `w-full h-full filter brightness-95 transition-all duration-300 ${hasObjectFit ? "" : "object-cover"}`;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#111113] overflow-hidden select-none flex items-center justify-center"
    >
      {inView && (
        whileHover ? (
          <motion.img
            ref={imgRef}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => {
              loadedImageUrls.add(src);
              setIsLoaded(true);
            }}
            onError={() => {
              setIsLoaded(true);
            }}
            whileHover={whileHover}
            transition={transition}
            className={`${defaultClasses} ${className} transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            {...props}
          />
        ) : (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => {
              loadedImageUrls.add(src);
              setIsLoaded(true);
            }}
            onError={() => {
              setIsLoaded(true);
            }}
            className={`${defaultClasses} ${className} transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            {...props}
          />
        )
      )}
      <div
        className={`absolute inset-0 bg-[#111113] pointer-events-none transition-opacity duration-300 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState<ProjectData[]>(DEFAULT_PROJECTS);

  useEffect(() => {
    // Load projects dynamically from Firestore API with persistent image overrides
    fetch("/api/projects")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        if (data) {
          const imagesMap = data.images || {};
          if (data.projects && data.projects.length > 0) {
            setProjects(data.projects.map((dp: ProjectData) => {
              const def = DEFAULT_PROJECTS.find(d => d.num === dp.num);
              return {
                ...dp,
                description: dp.description || def?.description,
                col1_1: imagesMap[`${dp.num}_col1_1`] || dp.col1_1,
                col1_2: imagesMap[`${dp.num}_col1_2`] || dp.col1_2,
                col2: imagesMap[`${dp.num}_col2`] || dp.col2,
              };
            }));
          } else if (Object.keys(imagesMap).length > 0) {
            setProjects((prev) =>
              prev.map((p) => ({
                ...p,
                col1_1: imagesMap[`${p.num}_col1_1`] || p.col1_1,
                col1_2: imagesMap[`${p.num}_col1_2`] || p.col1_2,
                col2: imagesMap[`${p.num}_col2`] || p.col2,
              }))
            );
          }
        }
      })
      .catch((err) => {
        console.warn("Using default static projects fallback:", err);
      });

    // Load saved project layouts from backend API
    fetch("/api/projects/layout")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.layouts) {
          Object.entries(data.layouts).forEach(([pNum, pLayout]) => {
            try {
              localStorage.setItem(`project_layouts_v2_${pNum}`, JSON.stringify(pLayout));
            } catch (e) {}
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section
      id="projects"
      className="bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 pt-24 pb-20 px-4 sm:px-8 md:px-10 relative z-30"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <FadeIn delay={0} y={40} duration={0.8} className="mb-12 md:mb-16">
          <h2 className="hero-heading font-black uppercase leading-none tracking-tight text-center text-5xl sm:text-7xl md:text-8xl lg:text-9xl">
            Projects
          </h2>
        </FadeIn>

        {/* Card Flow Container: Premium CSS-based sticky card stacking.
           Cards stack beautifully with very small gap, ensuring fast loading and immediate transition on scroll. */}
        <div className="relative flex flex-col gap-4 sm:gap-6 md:gap-8 pb-12">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id || project.num}
              project={project}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ProjectCardProps {
  project: ProjectData;
  index: number;
  key?: string;
}

interface ProjectImageProps {
  src: string;
  alt: string;
  isSolaris?: boolean;
  isHero?: boolean;
  parallaxOffset?: any;
  className?: string;
  containerClass?: string;
}

// Inline styles for high-fidelity rounded-corner clipping without destructive masks
const safariClipStyle: React.CSSProperties = {
  overflow: "hidden",
  isolation: "isolate",
};

interface EditableImageContainerProps {
  src: string;
  alt: string;
  imgKey: "img1" | "img2" | "img3";
  isSolaris: boolean;
  isEditing: boolean;
  layouts: {
    img1: { x: number; y: number; scale: number };
    img2: { x: number; y: number; scale: number };
    img3: { x: number; y: number; scale: number };
  };
  setLayouts: React.Dispatch<React.SetStateAction<{
    img1: { x: number; y: number; scale: number };
    img2: { x: number; y: number; scale: number };
    img3: { x: number; y: number; scale: number };
  }>>;
  priority?: boolean;
  parallaxOffset?: any;
  className?: string;
  containerClass?: string;
}

function EditableImageContainer({
  src,
  alt,
  imgKey,
  isSolaris,
  isEditing,
  layouts,
  setLayouts,
  priority = false,
  parallaxOffset,
  className = "",
  containerClass = "",
}: EditableImageContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isAlreadyLoaded = loadedImageUrls.has(src);
  const [inView, setInView] = useState(priority || isAlreadyLoaded);
  const [isLoaded, setIsLoaded] = useState(isAlreadyLoaded);

  useEffect(() => {
    if (priority || isAlreadyLoaded) {
      setInView(true);
      return;
    }
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "350px 0px", threshold: 0.01 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [src, isAlreadyLoaded, priority]);

  // Handle cached images where complete is true upon mount
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      loadedImageUrls.add(src);
      setIsLoaded(true);
    }
  }, [inView, src]);

  const layout = layouts[imgKey] || { x: 0, y: 0, scale: 1 };

  const clipStyle: React.CSSProperties = {
    overflow: "hidden",
    borderRadius: "inherit",
    isolation: "isolate",
    transform: "translate3d(0, 0, 0)",
    WebkitTransform: "translate3d(0, 0, 0)",
  };

  const handleSliderChange = (param: "x" | "y" | "scale", val: number) => {
    setLayouts((prev) => ({
      ...prev,
      [imgKey]: {
        ...prev[imgKey],
        [param]: val,
      },
    }));
  };

  const renderInner = () => {
    const imageStyle = {
      transform: `translate(${layout.x}px, ${layout.y}px) scale(${layout.scale})`,
      WebkitTransform: `translate(${layout.x}px, ${layout.y}px) scale(${layout.scale})`,
      borderRadius: "inherit",
    };

    return (
      <div ref={containerRef} className="w-full h-full relative rounded-[inherit]" style={clipStyle}>
        {inView && (
          <motion.img
            ref={imgRef}
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "low"}
            onLoad={() => {
              loadedImageUrls.add(src);
              setIsLoaded(true);
            }}
            onError={() => {
              setIsLoaded(true);
            }}
            style={imageStyle}
            className={`${className} absolute inset-0 w-full h-full object-cover origin-center z-10 rounded-[inherit] transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            whileHover={!isEditing ? {
              scale: layout.scale * 1.04,
              filter: "brightness(1.02) contrast(1.02)",
            } : undefined}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 18,
            }}
          />
        )}
        {/* Smooth placeholder that fades out gracefully */}
        <div
          className={`absolute inset-0 bg-[#111113] z-20 pointer-events-none transition-opacity duration-300 ${
            isLoaded ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Precision Layout Controls Overlay */}
        {isEditing && (
          <div className="absolute inset-x-0 bottom-0 bg-black/90 backdrop-blur-md p-2.5 z-40 border-t border-white/10 flex flex-col gap-1.5 select-none text-white rounded-b-[inherit]">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-zinc-400">
              <span>Adjusting {imgKey === "img3" ? "Hero View" : imgKey === "img1" ? "Detail 1" : "Detail 2"}</span>
              <span className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono text-[9px]">
                x: {layout.x}px | y: {layout.y}px | s: {layout.scale.toFixed(2)}x
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[9px] font-mono">
              {/* X Slider */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[#D7E2EA]/60">Shift X:</span>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  value={layout.x}
                  onChange={(e) => handleSliderChange("x", parseInt(e.target.value))}
                  className="w-full accent-[#B600A8] h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              {/* Y Slider */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[#D7E2EA]/60">Shift Y:</span>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  value={layout.y}
                  onChange={(e) => handleSliderChange("y", parseInt(e.target.value))}
                  className="w-full accent-[#B600A8] h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              {/* Scale Slider */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[#D7E2EA]/60">Scale:</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={layout.scale}
                  onChange={(e) => handleSliderChange("scale", parseFloat(e.target.value))}
                  className="w-full accent-[#B600A8] h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (parallaxOffset) {
    return (
      <motion.div style={{ x: parallaxOffset, ...clipStyle }} className={`w-[calc(100%+24px)] h-full -ml-[12px] relative rounded-[inherit] ${containerClass}`}>
        {renderInner()}
      </motion.div>
    );
  }

  return (
    <div className={`w-full h-full relative overflow-hidden rounded-[inherit] ${containerClass || "w-full h-full"}`} style={clipStyle}>
      {renderInner()}
    </div>
  );
}

function ProjectImage({
  src,
  alt,
  parallaxOffset,
  className = "",
  containerClass = "",
}: ProjectImageProps) {
  
  const renderInner = () => {
    return (
      <ImageWithLoader
        src={src}
        alt={alt}
        className={`${className} w-full h-full object-cover`}
        whileHover={{
          scale: 1.05,
          filter: "brightness(1.04) contrast(1.01)",
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 18,
        }}
        referrerPolicy="no-referrer"
      />
    );
  };

  if (parallaxOffset) {
    return (
      <motion.div style={{ x: parallaxOffset, ...safariClipStyle }} className="w-[calc(100%+24px)] h-full -ml-[12px] relative">
        {renderInner()}
      </motion.div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden" style={safariClipStyle}>
      {renderInner()}
    </div>
  );
}

function ProjectCard({ project, index }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  // Motion value for normalized mouse X coordinate inside the card (0 = left boundary, 1 = right boundary)
  const mouseX = useMotionValue(0.5); 
  
  // High-performance spring for ultra-responsive cursor movement
  const mouseXSpring = useSpring(mouseX, { stiffness: 120, damping: 20, mass: 0.1 });

  // Map mouse coordinate to horizontal translate offsets (Left images shift right, Right images shift left)
  const xOffsetLeft = useTransform(mouseXSpring, [0, 1], [-12, 12]);
  const xOffsetRight = useTransform(mouseXSpring, [0, 1], [12, -12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width;
    mouseX.set(normalizedX);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5); // smoothly return to center on cursor exit
  };

  const isSolaris = true;
  const isEditing = false;
  const storageKey = `project_layouts_v2_${project.num}`;

  const [layouts, setLayouts] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading layouts", e);
    }
    // Presets for each project to ensure perfect out-of-the-box presentation
    if (project.num === "03") {
      return {
        img1: { x: 0, y: -20, scale: 1.15 },
        img2: { x: 0, y: -20, scale: 1.15 },
        img3: { x: 0, y: -40, scale: 1.1 }
      };
    }
    return {
      img1: { x: 0, y: 0, scale: 1.0 },
      img2: { x: 0, y: 0, scale: 1.0 },
      img3: { x: 0, y: 0, scale: 1.0 }
    };
  });

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 1, y: 0 }}
      className="sticky w-full project-card rounded-[24px] sm:rounded-[32px] md:rounded-[40px] p-4 sm:p-5 md:p-6 flex flex-col justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.5),0_15px_35px_rgba(0,0,0,0.8)] border border-white/5 hover:border-[#B600A8]/30 bg-[#121212]/95 backdrop-blur-md transition-all duration-300"
      style={{
        top: `calc(4.5rem + ${index * 4.5}rem)`, // keeps previous headings perfectly visible as a stacked file tabs gallery!
        zIndex: index + 10,           // incremental z-index so later cards cover earlier ones while keeping top headers
      }}
    >
      {/* Top Row */}
      <div className="flex justify-between items-start gap-3 sm:gap-4 border-b border-[#D7E2EA]/10 pb-4">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Project Number */}
          <span className="font-black text-3xl sm:text-4xl md:text-5xl text-white select-none opacity-45 shrink-0 leading-none pt-0.5">
            {project.num}
          </span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[#D7E2EA]/60 uppercase tracking-widest text-[9px] sm:text-[10px] truncate max-w-full">
              {project.category}
            </span>
            <h3 className="text-white uppercase font-bold text-base sm:text-lg md:text-xl tracking-wide truncate">
              {project.title}
            </h3>
            {project.description && (
              <p className="text-[#D7E2EA]/65 text-[10px] sm:text-[11px] md:text-xs font-light mt-0.5 sm:mt-1 leading-snug truncate max-w-full">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls and Live Project Button */}
        <div className="shrink-0 flex items-start gap-2 sm:gap-3">
          {index === 0 ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={project.liveUrl || "https://village-restaurant-delta.vercel.app/"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm hover:bg-[#D7E2EA]/10 transition-colors duration-300 shrink-0"
              >
                Live Project
              </a>
              <a
                href={project.githubUrl || "https://github.com/HOLSIY/Village-Restaurant.git"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm hover:bg-[#D7E2EA]/10 transition-colors duration-300 shrink-0"
              >
                <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>GitHub</span>
              </a>
            </div>
          ) : index === 1 ? (
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex flex-col items-end">
                <button
                  type="button"
                  onClick={() => setShowComingSoon((prev) => !prev)}
                  className="inline-flex items-center justify-center rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm hover:bg-[#D7E2EA]/10 transition-colors duration-300 cursor-pointer shrink-0"
                >
                  Live Project
                </button>
                {showComingSoon && (
                  <p className="mt-1.5 text-[9px] sm:text-[10px] md:text-[11px] text-[#D7E2EA]/75 tracking-wide font-light whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] sm:max-w-[210px] text-right">
                    Coming soon — live preview in progress.
                  </p>
                )}
              </div>
              <a
                href={project.githubUrl || "https://github.com/HOLSIY/got-u"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm hover:bg-[#D7E2EA]/10 transition-colors duration-300 shrink-0"
              >
                <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>GitHub</span>
              </a>
            </div>
          ) : index === 2 ? (
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex flex-col items-end">
                <button
                  type="button"
                  onClick={() => setShowComingSoon((prev) => !prev)}
                  className="inline-flex items-center justify-center rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm hover:bg-[#D7E2EA]/10 transition-colors duration-300 cursor-pointer shrink-0"
                >
                  Live Project
                </button>
                {showComingSoon && (
                  <p className="mt-1.5 text-[9px] sm:text-[10px] md:text-[11px] text-[#D7E2EA]/75 tracking-wide font-light whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] sm:max-w-[210px] text-right">
                    Coming soon — platform under development.
                  </p>
                )}
              </div>
              <a
                href={project.githubUrl || "https://github.com/HOLSIY/EthioMerit---Public-Recruitment-Anti-Corruption-Platform"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm hover:bg-[#D7E2EA]/10 transition-colors duration-300 shrink-0"
              >
                <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>GitHub</span>
              </a>
            </div>
          ) : (
            <LiveProjectButton />
          )}
        </div>
      </div>

      {/* Bottom Row - Responsive Image Grid */}
      <div className="flex-1 mt-4">
        {/* Mobile View: Smooth horizontal ribbon scroll, no snapping, and pan-y to allow flawless vertical scrolling */}
        <div 
          className="flex sm:hidden overflow-x-auto gap-4 pb-2 scrollbar-none scroll-smooth touch-pan-y"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Item 1 */}
          <div className="shrink-0 w-[240px] overflow-hidden rounded-[16px] h-[160px] relative border border-white/5 bg-[#111113] isolate clip-container-16" style={safariClipStyle}>
            <EditableImageContainer
              src={project.col1_1}
              alt={`${project.title} Detail 1`}
              imgKey="img1"
              isSolaris={isSolaris}
              isEditing={isEditing}
              layouts={layouts}
              setLayouts={setLayouts}
              priority={index === 0}
              className="w-full h-full object-cover filter brightness-95"
              containerClass="w-full h-full"
            />
            {!isEditing && (
              <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono font-bold text-[#D7E2EA]/60 tracking-wider z-20 pointer-events-none">
                01 / DETAIL VIEW
              </div>
            )}
          </div>

          {/* Item 2 */}
          <div className="shrink-0 w-[240px] overflow-hidden rounded-[16px] h-[160px] relative border border-white/5 bg-[#111113] isolate clip-container-16" style={safariClipStyle}>
            <EditableImageContainer
              src={project.col1_2}
              alt={`${project.title} Detail 2`}
              imgKey="img2"
              isSolaris={isSolaris}
              isEditing={isEditing}
              layouts={layouts}
              setLayouts={setLayouts}
              priority={index === 0}
              className="w-full h-full object-cover filter brightness-95"
              containerClass="w-full h-full"
            />
            {!isEditing && (
              <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono font-bold text-[#D7E2EA]/60 tracking-wider z-20 pointer-events-none">
                02 / COMPONENT DETAIL
              </div>
            )}
          </div>

          {/* Item 3 */}
          <div className="shrink-0 w-[240px] overflow-hidden rounded-[16px] h-[160px] relative border border-white/5 bg-[#111113] isolate clip-container-16" style={safariClipStyle}>
            <EditableImageContainer
              src={project.col2}
              alt={`${project.title} Hero View`}
              imgKey="img3"
              isSolaris={isSolaris}
              isEditing={isEditing}
              layouts={layouts}
              setLayouts={setLayouts}
              priority={index === 0}
              className="w-full h-full object-cover filter brightness-95"
              containerClass="w-full h-full"
            />
            {!isEditing && (
              <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono font-bold text-white tracking-wider z-20 pointer-events-none">
                03 / HERO SYSTEM
              </div>
            )}
          </div>
        </div>

        {/* Desktop View: Premium Two-Column Bento Grid with Cursor Parallax */}
        <div className="hidden sm:grid grid-cols-12 gap-4 md:gap-5 h-[220px] sm:h-[260px] md:h-[300px] lg:h-[340px]">
          {/* Left Column (40% width, holds 2 stacked images, moving in Left Parallax direction) */}
          <div className="col-span-5 flex flex-col gap-3 md:gap-4 justify-between h-full">
            {/* Top Image */}
            <div className="w-full overflow-hidden rounded-[24px] md:rounded-[28px] relative group h-[47%] border border-white/5 bg-[#111113] isolate [transform:translateZ(0)] clip-container-24" style={safariClipStyle}>
              <EditableImageContainer
                src={project.col1_1}
                alt={`${project.title} Detail 1`}
                imgKey="img1"
                isSolaris={isSolaris}
                isEditing={isEditing}
                layouts={layouts}
                setLayouts={setLayouts}
                priority={index === 0}
                parallaxOffset={xOffsetLeft}
                className="w-full h-full object-cover filter brightness-95 saturate-95"
                containerClass="w-[calc(100%+24px)] h-full -ml-[12px]"
              />
            </div>

            {/* Bottom Image */}
            <div className="w-full overflow-hidden rounded-[24px] md:rounded-[28px] relative group h-[47%] border border-white/5 bg-[#111113] isolate [transform:translateZ(0)] clip-container-24" style={safariClipStyle}>
              <EditableImageContainer
                src={project.col1_2}
                alt={`${project.title} Detail 2`}
                imgKey="img2"
                isSolaris={isSolaris}
                isEditing={isEditing}
                layouts={layouts}
                setLayouts={setLayouts}
                priority={index === 0}
                parallaxOffset={xOffsetLeft}
                className="w-full h-full object-cover filter brightness-95 saturate-95"
                containerClass="w-[calc(100%+24px)] h-full -ml-[12px]"
              />
            </div>
          </div>

          {/* Right Column (60% width, holds 1 tall image, moving in Right Parallax direction) */}
          <div className="col-span-7 h-full overflow-hidden rounded-[24px] md:rounded-[28px] relative group border border-white/5 bg-[#111113] isolate [transform:translateZ(0)] clip-container-24" style={safariClipStyle}>
            <EditableImageContainer
              src={project.col2}
              alt={`${project.title} Hero View`}
              imgKey="img3"
              isSolaris={isSolaris}
              isEditing={isEditing}
              layouts={layouts}
              setLayouts={setLayouts}
              priority={index === 0}
              parallaxOffset={xOffsetRight}
              className="w-full h-full object-cover filter brightness-95 saturate-95"
              containerClass="w-[calc(100%+24px)] h-full -ml-[12px]"
            />
          </div>
        </div>
      </div>

    </motion.div>
  );
}
