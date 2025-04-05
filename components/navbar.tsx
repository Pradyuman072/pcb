"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CircuitBoard, Cpu, Zap, Menu, X, Github, Settings, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { setTheme, theme, resolvedTheme } = useTheme()

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    if (theme === "dark" || resolvedTheme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-md border-b shadow-md" : "bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center">
        <motion.div variants={itemVariants} className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2 group">
            <CircuitBoard className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
            <span className="hidden font-bold sm:inline-block text-primary">Illumitrace</span>
          </Link>
        </motion.div>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between md:space-x-4">
          <motion.nav variants={navVariants} className="flex items-center space-x-6">
            <motion.div variants={itemVariants}>
              <Link
                href="#"
                className={cn(
                  "flex items-center text-sm font-medium transition-all duration-300",
                  "px-3 py-2 rounded-md relative overflow-hidden group",
                )}
              >
                <Zap className="mr-2 h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                <span className="relative z-10 group-hover:text-primary-foreground transition-colors duration-300">
                  Schematic
                </span>
                <span className="absolute inset-0 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 rounded-md"></span>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                href="#"
                className={cn(
                  "flex items-center text-sm font-medium transition-all duration-300",
                  "px-3 py-2 rounded-md relative overflow-hidden group",
                )}
              >
                <CircuitBoard className="mr-2 h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                <span className="relative z-10 group-hover:text-primary-foreground transition-colors duration-300">
                  PCB View
                </span>
                <span className="absolute inset-0 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 rounded-md"></span>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                href="#"
                className={cn(
                  "flex items-center text-sm font-medium transition-all duration-300",
                  "px-3 py-2 rounded-md relative overflow-hidden group",
                )}
              >
                <Cpu className="mr-2 h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                <span className="relative z-10 group-hover:text-primary-foreground transition-colors duration-300">
                  Simulation
                </span>
                <span className="absolute inset-0 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 rounded-md"></span>
              </Link>
            </motion.div>
          </motion.nav>
          <motion.div variants={navVariants} className="flex items-center space-x-2">
            <motion.div variants={itemVariants}>
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-primary/50 text-primary hover:text-primary-foreground hover:bg-primary/90 transition-all duration-300"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 border-primary/50 text-primary hover:text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                onClick={toggleTheme}
              >
                {mounted && (theme === "dark" || resolvedTheme === "dark") ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 border-primary/50 text-primary hover:text-primary-foreground hover:bg-primary/90 transition-all duration-300"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden h-9 w-9 text-primary hover:bg-primary/20"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="container md:hidden border-t border-primary/20 bg-background/95 backdrop-blur-sm"
        >
          <div className="flex flex-col space-y-1 py-2">
            <Link
              href="#"
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-colors duration-300",
                "rounded-md hover:bg-primary/20 hover:text-primary",
              )}
            >
              <Zap className="mr-2 h-4 w-4 text-primary" />
              Schematic
            </Link>
            <Link
              href="#"
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-colors duration-300",
                "rounded-md hover:bg-primary/20 hover:text-primary",
              )}
            >
              <CircuitBoard className="mr-2 h-4 w-4 text-primary" />
              PCB View
            </Link>
            <Link
              href="#"
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-colors duration-300",
                "rounded-md hover:bg-primary/20 hover:text-primary",
              )}
            >
              <Cpu className="mr-2 h-4 w-4 text-primary" />
              Simulation
            </Link>
            <div className="flex items-center space-x-2 pt-2 px-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 border-primary/50 text-primary hover:text-primary-foreground hover:bg-primary/90 transition-all duration-300"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 border-primary/50 text-primary hover:text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                onClick={toggleTheme}
              >
                {mounted && (theme === "dark" || resolvedTheme === "dark") ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 border-primary/50 text-primary hover:text-primary-foreground hover:bg-primary/90 transition-all duration-300"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}

