import React from "react";

interface ContactButtonProps {
  onClick?: () => void;
  label?: string;
  className?: string;
}

export default function ContactButton({
  onClick,
  label = "Contact Me",
  className = "",
}: ContactButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-full text-white font-medium uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base contact-btn-grad ${className}`}
    >
      {label}
    </button>
  );
}
