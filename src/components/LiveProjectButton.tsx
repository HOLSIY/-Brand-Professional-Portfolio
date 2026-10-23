import React from "react";

interface LiveProjectButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function LiveProjectButton({
  href = "#",
  label = "Live Project",
  className = "",
}: LiveProjectButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-xs sm:text-sm hover:bg-[#D7E2EA]/10 transition-colors duration-300 ${className}`}
    >
      {label}
    </a>
  );
}
