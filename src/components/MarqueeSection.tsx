import React, { useRef, useEffect, useState, memo } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";
import FadeIn from "./FadeIn";

export interface MarqueeItemConfig {
  id: number;
  mp4: string;
  poster: string;
}

// Row 1: Original Motion Designs 0 to 10
const ROW1_ITEMS: MarqueeItemConfig[] = [
  { id: 1, mp4: "/marquee/item_0.mp4", poster: "/marquee/item_0_poster.jpg" },
  { id: 2, mp4: "/marquee/item_1.mp4", poster: "/marquee/item_1_poster.jpg" },
  { id: 3, mp4: "/marquee/item_2.mp4", poster: "/marquee/item_2_poster.jpg" },
  { id: 4, mp4: "/marquee/item_3.mp4", poster: "/marquee/item_3_poster.jpg" },
  { id: 5, mp4: "/marquee/item_4.mp4", poster: "/marquee/item_4_poster.jpg" },
  { id: 6, mp4: "/marquee/item_5.mp4", poster: "/marquee/item_5_poster.jpg" },
  { id: 7, mp4: "/marquee/item_6.mp4", poster: "/marquee/item_6_poster.jpg" },
  { id: 8, mp4: "/marquee/item_7.mp4", poster: "/marquee/item_7_poster.jpg" },
  { id: 9, mp4: "/marquee/item_8.mp4", poster: "/marquee/item_8_poster.jpg" },
  { id: 10, mp4: "/marquee/item_9.mp4", poster: "/marquee/item_9_poster.jpg" },
  { id: 11, mp4: "/marquee/item_10.mp4", poster: "/marquee/item_10_poster.jpg" },
];

// Row 2: Original Motion Designs 11 to 20
const ROW2_ITEMS: MarqueeItemConfig[] = [
  { id: 12, mp4: "/marquee/item_11.mp4", poster: "/marquee/item_11_poster.jpg" },
  { id: 13, mp4: "/marquee/item_12.mp4", poster: "/marquee/item_12_poster.jpg" },
  { id: 14, mp4: "/marquee/item_13.mp4", poster: "/marquee/item_13_poster.jpg" },
  { id: 15, mp4: "/marquee/item_14.mp4", poster: "/marquee/item_14_poster.jpg" },
  { id: 16, mp4: "/marquee/item_15.mp4", poster: "/marquee/item_15_poster.jpg" },
  { id: 17, mp4: "/marquee/item_16.mp4", poster: "/marquee/item_16_poster.jpg" },
  { id: 18, mp4: "/marquee/item_17.mp4", poster: "/marquee/item_17_poster.jpg" },
  { id: 19, mp4: "/marquee/item_18.mp4", poster: "/marquee/item_18_poster.jpg" },
  { id: 20, mp4: "/marquee/item_19.mp4", poster: "/marquee/item_19_poster.jpg" },
  { id: 21, mp4: "/marquee/item_20.mp4", poster: "/marquee/item_20_poster.jpg" },
];

// Tripled lists for seamless infinite loop scroll
const ROW1_TRIPLED = [...ROW1_ITEMS, ...ROW1_ITEMS, ...ROW1_ITEMS];
const ROW2_TRIPLED = [...ROW2_ITEMS, ...ROW2_ITEMS, ...ROW2_ITEMS];

const MotionCard = memo(({ item, isPriority }: { item: MarqueeItemConfig; isPriority?: boolean }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="relative w-[280px] h-[180px] sm:w-[350px] sm:h-[225px] md:w-[420px] md:h-[270px] flex-shrink-0 rounded-2xl overflow-hidden bg-[#121212] border border-white/5 select-none transform-gpu">
      {/* Poster image provides zero-delay instantaneous rendering */}
      <img
        src={item.poster}
        alt=""
        loading={isPriority ? "eager" : "lazy"}
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
          videoLoaded ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Original authentic motion video */}
      <video
        src={item.mp4}
        poster={item.poster}
        autoPlay
        loop
        muted
        playsInline
        preload={isPriority ? "auto" : "metadata"}
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
          videoLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
});

function MarqueeSectionComponent() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Motion value for normalized mouse X coordinate
  const mouseX = useMotionValue(0.5);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = e.clientX / window.innerWidth;
      mouseX.set(normalizedX);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  // Track scroll progress of marquee section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Calculate base scrolling translations
  const row1Scroll = useTransform(scrollYProgress, [0, 1], [-150, 250]);
  const row2Scroll = useTransform(scrollYProgress, [0, 1], [150, -250]);

  // Transform mouse movement into parallax offset
  const row1MouseOffset = useTransform(mouseX, [0, 1], [-200, 200]);
  const row2MouseOffset = useTransform(mouseX, [0, 1], [200, -200]);

  // Springs for silky smooth interpolation
  const row1ScrollSpring = useSpring(row1Scroll, { stiffness: 60, damping: 22, mass: 0.3 });
  const row2ScrollSpring = useSpring(row2Scroll, { stiffness: 60, damping: 22, mass: 0.3 });

  const row1MouseSpring = useSpring(row1MouseOffset, { stiffness: 180, damping: 30, mass: 0.1 });
  const row2MouseSpring = useSpring(row2MouseOffset, { stiffness: 180, damping: 30, mass: 0.1 });

  // Map spring values to continuous CSS calc templates
  const row1X = useTransform([row1ScrollSpring, row1MouseSpring], ([scrollVal, mouseVal]) => {
    const s = typeof scrollVal === "number" ? scrollVal : 0;
    const m = typeof mouseVal === "number" ? mouseVal : 0;
    return `calc(-33.33% + ${s + m}px)`;
  });

  const row2X = useTransform([row2ScrollSpring, row2MouseSpring], ([scrollVal, mouseVal]) => {
    const s = typeof scrollVal === "number" ? scrollVal : 0;
    const m = typeof mouseVal === "number" ? mouseVal : 0;
    return `calc(-33.33% + ${s + m}px)`;
  });

  return (
    <section
      ref={sectionRef}
      id="marquee-section"
      className="bg-transparent pt-20 sm:pt-28 md:pt-36 pb-12 overflow-hidden w-full select-none min-h-[400px]"
    >
      {/* Topic Header */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center mb-10 sm:mb-14 md:mb-16">
        <FadeIn delay={0} y={30} duration={0.8}>
          <h2 className="font-extrabold uppercase tracking-tight text-3xl sm:text-5xl md:text-6xl text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.7)]">
            MOTION-DRIVEN WEB EXPERIENCES
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-[#D7E2EA]/80 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
            I build interactive web experiences where motion, visuals, and user interaction work together.
          </p>
        </FadeIn>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {/* ROW 1: Moves RIGHT */}
        <div className="overflow-hidden w-full">
          <motion.div
            className="flex gap-3 w-max will-change-transform"
            style={{ x: row1X }}
          >
            {ROW1_TRIPLED.map((item, index) => (
              <MotionCard
                key={`row1-${item.id}-${index}`}
                item={item}
                isPriority={index < 4}
              />
            ))}
          </motion.div>
        </div>

        {/* ROW 2: Moves LEFT */}
        <div className="overflow-hidden w-full">
          <motion.div
            className="flex gap-3 w-max will-change-transform"
            style={{ x: row2X }}
          >
            {ROW2_TRIPLED.map((item, index) => (
              <MotionCard
                key={`row2-${item.id}-${index}`}
                item={item}
                isPriority={index < 4}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default memo(MarqueeSectionComponent);
