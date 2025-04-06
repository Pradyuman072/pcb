"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CircuitBoard } from "lucide-react"

export default function Preloader() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!loading) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: loading ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="relative mb-4"
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl"></div>
          <CircuitBoard className="h-40 w-40 text-primary" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold tracking-tight text-primary dark:text-glow"
        >
          Illumitrace
        </motion.h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "200px" }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="mt-4 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full"
        />
      </div>
    </motion.div>
  )
}

