import { motion, useScroll, useTransform } from "motion/react";
import React, { useRef } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export default function AnimatedText({ text, className = "" }: AnimatedTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  });

  const words = text.split(" ");
  const totalWords = words.length;

  return (
    <p ref={containerRef} className={className}>
      {words.map((word, i) => {
        const start = i / totalWords;
        const end = Math.min(1, (i + 1.5) / totalWords);

        return (
          <Word
            key={i}
            word={word}
            progress={scrollYProgress}
            range={[start, end]}
          />
        );
      })}
    </p>
  );
}

interface WordProps {
  word: string;
  progress: any;
  range: [number, number];
  key?: any;
}

function Word({ word, progress, range }: WordProps) {
  const opacity = useTransform(progress, range, [0.25, 1]);

  return (
    <span className="relative inline-block mr-[0.25em]">
      <span className="opacity-0">{word}</span>
      <motion.span style={{ opacity }} className="absolute left-0 top-0">
        {word}
      </motion.span>
    </span>
  );
}
