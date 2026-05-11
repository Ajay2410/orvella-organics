import type { Variants } from 'motion/react';

// Distinct creative page-level animations
export const homeVariants: Variants = {
  hidden: { opacity: 0, x: -60, rotate: -6, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    scale: 1,
    transition: { duration: 0.9, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.06 },
  },
  exit: { opacity: 0, x: 40, transition: { duration: 0.5, ease: 'easeIn' } },
};

export const aboutVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.75, type: 'spring', stiffness: 120 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.45 } },
};

export const productsVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.04 },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 18 } },
};

export default { homeVariants, aboutVariants, productsVariants };
