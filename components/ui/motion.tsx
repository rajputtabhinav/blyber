"use client";

import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { forwardRef } from "react";

/**
 * Blyber motion vocabulary
 * -----------------------------------------------------------
 * Tone: subtle, fast (≤200ms), no springs. Linear-style.
 * Easing: [0.2, 0, 0.2, 1] — gentle ease-in-out.
 * Translates: max 6px. Opacity is the primary effect.
 */

const EASE = [0.2, 0, 0.2, 1] as const;
const DUR = 0.18;

const fadeVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  shown: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } },
};

const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 6 },
  shown: { opacity: 1, x: 0, transition: { duration: DUR, ease: EASE } },
  exit: { opacity: 0, x: 6, transition: { duration: 0.12, ease: EASE } },
};

const containerVariants: Variants = {
  hidden: {},
  shown: {
    transition: { staggerChildren: 0.022, delayChildren: 0.02 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 3 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.16, ease: EASE } },
};

// ---------------------------------------------------------------
// FadeIn — one-shot page or section mount
// ---------------------------------------------------------------
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial="hidden"
      animate="shown"
      variants={fadeVariants}
      transition={{ duration: DUR, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------
// SlideIn — side panels, drawers (mounted/unmounted by state)
// ---------------------------------------------------------------
export function SlideIn({
  children,
  className,
  show = true,
}: {
  children: React.ReactNode;
  className?: string;
  show?: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial="hidden"
          animate="shown"
          exit="exit"
          variants={slideRightVariants}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------
// Stagger — parent that orchestrates child reveal
// ---------------------------------------------------------------
type StaggerTag = "div" | "tbody" | "section";

export const Stagger = forwardRef<
  HTMLElement,
  {
    children: React.ReactNode;
    as?: StaggerTag;
    className?: string;
    style?: React.CSSProperties;
  }
>(function Stagger({ children, as = "div", className, style }, ref) {
  const reduced = useReducedMotion();
  if (reduced) {
    if (as === "tbody") {
      return (
        <tbody ref={ref as never} className={className} style={style}>
          {children}
        </tbody>
      );
    }
    if (as === "section") {
      return (
        <section ref={ref as never} className={className} style={style}>
          {children}
        </section>
      );
    }
    return (
      <div ref={ref as never} className={className} style={style}>
        {children}
      </div>
    );
  }
  const Comp =
    as === "tbody" ? motion.tbody : as === "section" ? motion.section : motion.div;
  return (
    <Comp
      ref={ref as never}
      initial="hidden"
      animate="shown"
      variants={containerVariants}
      className={className}
      style={style}
    >
      {children}
    </Comp>
  );
});

// ---------------------------------------------------------------
// StaggerItem — child of <Stagger>
// ---------------------------------------------------------------
type ItemTag = "div" | "tr" | "li";

export function StaggerItem({
  children,
  as = "div",
  className,
  onClick,
  style,
}: {
  children: React.ReactNode;
  as?: ItemTag;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    if (as === "tr") {
      return (
        <tr className={className} onClick={onClick} style={style}>
          {children}
        </tr>
      );
    }
    if (as === "li") {
      return (
        <li className={className} onClick={onClick} style={style}>
          {children}
        </li>
      );
    }
    return (
      <div className={className} onClick={onClick} style={style}>
        {children}
      </div>
    );
  }
  const Comp = as === "tr" ? motion.tr : as === "li" ? motion.li : motion.div;
  return (
    <Comp variants={itemVariants} className={className} onClick={onClick} style={style}>
      {children}
    </Comp>
  );
}

// ---------------------------------------------------------------
// PulseDot — tiny breathing ring for critical severities
// ---------------------------------------------------------------
export function PulseDot({
  color = "#EF4444",
  size = 8,
}: {
  color?: string;
  size?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      {!reduced && (
        <motion.span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: color,
          }}
          animate={{ opacity: [0.55, 0, 0.55], scale: [1, 2.2, 1] }}
          transition={{ duration: 2.0, ease: "easeOut", repeat: Infinity }}
        />
      )}
      <span
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
        }}
      />
    </span>
  );
}

// ---------------------------------------------------------------
// HoverLift — subtle interactive feedback for cards/tiles
// ---------------------------------------------------------------
export function HoverLift({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -1, transition: { duration: 0.12, ease: EASE } }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
