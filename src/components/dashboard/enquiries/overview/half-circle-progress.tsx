"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface HalfCircleProgressTopProps {
  progress: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
}

export default function HalfCircleProgressTop({
  progress,
  strokeWidth = 20,
  trackColor = "#E5E7EB",
  progressColor = "#7747FF",
}: HalfCircleProgressTopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(100);

  useEffect(() => {
    if (containerRef.current) {
      setSize(containerRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setSize(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div ref={containerRef} className="relative w-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size / 2}`}>
        {/* Background Arc */}
        <path
          d={`M ${strokeWidth / 2},${size / 2} A ${radius} ${radius} 0 0 1 ${
            size - strokeWidth / 2
          },${size / 2}`}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Animated Progress Arc */}
        <motion.path
          d={`M ${strokeWidth / 2},${size / 2} A ${radius} ${radius} 0 0 1 ${
            size - strokeWidth / 2
          },${size / 2}`}
          fill="transparent"
          stroke={progressColor}
          strokeWidth={strokeWidth - strokeWidth * 0.4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
