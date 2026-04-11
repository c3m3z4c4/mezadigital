"use client";

import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
}

export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.12 });

  return (
    <div
      ref={ref}
      className={cn("reveal", inView && "visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
