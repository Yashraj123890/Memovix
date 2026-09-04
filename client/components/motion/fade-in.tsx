"use client";

import { motion, type HTMLMotionProps } from "motion/react";

export interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

/**
 * Reusable enter animation — subtle opacity + small upward slide, ~200ms
 * ease-out. First Motion primitive in the app; reuse this instead of
 * writing new initial/animate/transition props inline wherever a simple
 * fade-in entrance is needed (first used by CommentComposer's action row).
 */
export function FadeIn({ delay = 0, children, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
