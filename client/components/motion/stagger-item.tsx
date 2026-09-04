"use client";

import { motion, type HTMLMotionProps } from "motion/react";

interface StaggerItemProps extends Omit<HTMLMotionProps<"li">, "children"> {
  /** Position within the list — used to compute the entrance delay. */
  index?: number;
  children: React.ReactNode;
}

const STAGGER_STEP_SECONDS = 0.04;

/**
 * List item with a staggered fade-in entrance (delayed by `index`) and a
 * collapse-out exit — wrap the parent list in <AnimatePresence> from
 * "motion/react" for the exit to actually play. Reusable anywhere a list
 * needs "items appear one after another, shrink away on removal" instead
 * of duplicating these variants (first used by CommentsList).
 */
export function StaggerItem({ index = 0, children, ...props }: StaggerItemProps) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, delay: index * STAGGER_STEP_SECONDS, ease: "easeOut" },
      }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.li>
  );
}
