'use client'

import { motion } from 'framer-motion'

export default function MotionDiv({ children, className, initial, animate, transition, ...props }) {
  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  )
}
