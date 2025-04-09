"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function ProjectsPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const projects = [
    {
      title: "LED Flasher Circuit",
      description: "A simple circuit that makes LEDs flash in sequence using 555 timers.",
      image: "/placeholder.svg?height=200&width=400",
      difficulty: "Beginner",
      components: ["555 Timer", "LEDs", "Resistors", "Capacitors"],
      docLink: "/docs/led-flasher",
    },
    {
      title: "Audio Amplifier",
      description: "A basic audio amplifier circuit using transistors and op-amps.",
      image: "/placeholder.svg?height=200&width=400",
      difficulty: "Intermediate",
      components: ["Op-Amps", "Transistors", "Resistors", "Capacitors"],
      docLink: "/docs/audio-amplifier",
    },
    {
      title: "Power Supply Unit",
      description: "A regulated DC power supply with adjustable voltage output.",
      image: "/placeholder.svg?height=200&width=400",
      difficulty: "Intermediate",
      components: ["Transformer", "Diodes", "Capacitors", "Voltage Regulator"],
      docLink: "/docs/power-supply",
    },
    {
      title: "Arduino Weather Station",
      description: "A weather monitoring station using Arduino and various sensors.",
      image: "/placeholder.svg?height=200&width=400",
      difficulty: "Advanced",
      components: ["Arduino", "Temperature Sensor", "Humidity Sensor", "LCD Display"],
      docLink: "/docs/weather-station",
    },
    {
      title: "Digital Clock",
      description: "A digital clock circuit with LED display and alarm function.",
      image: "/placeholder.svg?height=200&width=400",
      difficulty: "Advanced",
      components: ["Microcontroller", "7-Segment Display", "Crystal Oscillator", "Buzzer"],
      docLink: "/docs/digital-clock",
    },
  ]

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging && containerRef.current) {
        setActiveIndex((prev) => (prev + 1) % projects.length)
        const cardWidth = containerRef.current.scrollWidth / projects.length
        containerRef.current.scrollTo({
          left: ((activeIndex + 1) % projects.length) * cardWidth,
          behavior: "smooth",
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [activeIndex, isDragging, projects.length])

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0))
    setScrollLeft(containerRef.current?.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (containerRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 2
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (containerRef.current) {
      const cardWidth = containerRef.current.scrollWidth / projects.length
      const newIndex = Math.round(containerRef.current.scrollLeft / cardWidth)
      setActiveIndex(newIndex)
      containerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Featured Projects</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our collection of circuit design projects with complete documentation
        </p>
      </div>

      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory pb-8 hide-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {projects.map((project, index) => (
          <div key={index} className="min-w-full sm:min-w-[80%] md:min-w-[60%] lg:min-w-[40%] px-4 snap-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{
                scale: activeIndex === index ? 1 : 0.9,
                opacity: activeIndex === index ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${project.image})` }} />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{project.title}</CardTitle>
                    <Badge
                      variant={
                        project.difficulty === "Beginner"
                          ? "default"
                          : project.difficulty === "Intermediate"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {project.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.components.map((component, i) => (
                      <Badge key={i} variant="outline">
                        {component}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Link href={project.docLink}>
                    <Button variant="ghost" size="sm">
                      Documentation <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        {projects.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              activeIndex === index ? "bg-primary" : "bg-primary/20"
            } transition-colors`}
            onClick={() => {
              setActiveIndex(index)
              if (containerRef.current) {
                const cardWidth = containerRef.current.scrollWidth / projects.length
                containerRef.current.scrollTo({
                  left: index * cardWidth,
                  behavior: "smooth",
                })
              }
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
