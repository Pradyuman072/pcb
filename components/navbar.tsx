"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CircuitBoard, Cpu, Zap, Menu, X, Github, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <CircuitBoard className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Illumitrace</span>
          </Link>
        </div>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between md:space-x-4">
          <nav className="flex items-center space-x-6">
            <Link 
              href="#" 
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                "px-3 py-2 rounded-md hover:bg-accent"
              )}
            >
              <Zap className="mr-2 h-4 w-4" />
              Schematic
            </Link>
            <Link 
              href="#" 
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                "px-3 py-2 rounded-md hover:bg-accent"
              )}
            >
              <CircuitBoard className="mr-2 h-4 w-4" />
              PCB View
            </Link>
            <Link 
              href="#" 
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                "px-3 py-2 rounded-md hover:bg-accent"
              )}
            >
              <Cpu className="mr-2 h-4 w-4" />
              Simulation
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-9">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto md:hidden h-9 w-9" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="container md:hidden border-t">
          <div className="flex flex-col space-y-1 py-2">
            <Link 
              href="#" 
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                "rounded-md hover:bg-accent"
              )}
            >
              <Zap className="mr-2 h-4 w-4" />
              Schematic
            </Link>
            <Link 
              href="#" 
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                "rounded-md hover:bg-accent"
              )}
            >
              <CircuitBoard className="mr-2 h-4 w-4" />
              PCB View
            </Link>
            <Link 
              href="#" 
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                "rounded-md hover:bg-accent"
              )}
            >
              <Cpu className="mr-2 h-4 w-4" />
              Simulation
            </Link>
            <div className="flex items-center space-x-2 pt-2 px-2">
              <Button variant="outline" size="sm" className="flex-1 h-9">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}