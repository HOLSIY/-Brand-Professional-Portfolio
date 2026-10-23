import React, { useState, useEffect, useRef } from "react";

// Global cache tracking URLs that have already loaded in this session to prevent re-downloads or re-animation
export const loadedImageUrls = new Set<string>();

export interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "onLoad"> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  rootMargin?: string;
  priority?: boolean;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  onLoad?: () => void;
  srcSet?: string;
  sizes?: string;
}

export function LazyImage({
  src,
  alt,
  className = "",
  placeholderClassName = "",
  rootMargin = "300px 100px",
  priority = false,
  onLoad,
  srcSet,
  sizes,
  ...props
}: LazyImageProps) {
  const isAlreadyLoaded = loadedImageUrls.has(src);
  const [inView, setInView] = useState(priority || isAlreadyLoaded);
  const [isLoaded, setIsLoaded] = useState(isAlreadyLoaded);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority || isAlreadyLoaded) {
      setInView(true);
      return;
    }

    if (!containerRef.current) return;

    // Use IntersectionObserver so the image is ONLY fetched when entering viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [src, isAlreadyLoaded, rootMargin, priority]);

  // Handle cached images where complete is true before or upon mount
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      loadedImageUrls.add(src);
      setIsLoaded(true);
      if (onLoad) onLoad();
    }
  }, [inView, src, onLoad]);

  const handleImageLoad = () => {
    loadedImageUrls.add(src);
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  const handleImageError = () => {
    // Avoid blocking UI with endless placeholder if network blip occurs
    setIsLoaded(true);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${placeholderClassName || "w-full h-full bg-[#111113]"}`}
    >
      {inView && (
        <img
          ref={imgRef}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`${className} transition-opacity duration-300 ease-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          {...props}
        />
      )}
      <div
        className={`absolute inset-0 bg-[#111113] pointer-events-none transition-opacity duration-300 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}

export default LazyImage;
