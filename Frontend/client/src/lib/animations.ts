import type { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const cardHover = {
  rest: { y: 0, scale: 1, boxShadow: "6px 9px 23px rgba(42,65,55,.07)" },
  hover: {
    y: -4,
    scale: 1.01,
    boxShadow: "8px 14px 32px rgba(42,65,55,.12)",
    transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
  },
};

export const floatAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 4,
    ease: "easeInOut",
    repeat: Infinity,
  },
};

export const floatAnimationSlow = {
  y: [0, -6, 0],
  transition: {
    duration: 5,
    ease: "easeInOut",
    repeat: Infinity,
  },
};

export const pulseGlow = {
  scale: [1, 1.04, 1],
  opacity: [0.7, 1, 0.7],
  transition: {
    duration: 3,
    ease: "easeInOut",
    repeat: Infinity,
  },
};
