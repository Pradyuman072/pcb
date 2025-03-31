"use client"

import type React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { useDrag } from "react-dnd"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCircuitComponents } from "./circuit-component-context"
import {
  Zap,
  Battery,
  Circle,
  Square,
  ToggleLeft,
  Lightbulb,
  Search,
  Layers,
  Gauge,
  Wrench,
  Fan,
  Power,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { motion } from "framer-motion"

// Custom icons for electronic components
const Resistor = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12h5" />
    <path d="M17 12h5" />
    <rect x="7" y="9" width="10" height="6" rx="2" />
  </svg>
)

const Capacitor = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12h7" />
    <path d="M15 12h7" />
    <path d="M9 6v12" />
    <path d="M15 6v12" />
  </svg>
)

const Diode = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 12h6" />
    <path d="M14 12h6" />
    <polygon points="10 8 14 12 10 16" />
    <line x1="14" y1="8" x2="14" y2="16" />
  </svg>
)

const Transistor = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="6" />
    <line x1="12" y1="6" x2="12" y2="2" />
    <line x1="6" y1="18" x2="6" y2="22" />
    <line x1="18" y1="18" x2="18" y2="22" />
  </svg>
)

const Chip = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="5" y="5" width="14" height="14" rx="2" />
    <line x1="9" y1="2" x2="9" y2="5" />
    <line x1="15" y1="2" x2="15" y2="5" />
    <line x1="9" y1="19" x2="9" y2="22" />
    <line x1="15" y1="19" x2="15" y2="22" />
    <line x1="2" y1="9" x2="5" y2="9" />
    <line x1="2" y1="15" x2="5" y2="15" />
    <line x1="19" y1="9" x2="22" y2="9" />
    <line x1="19" y1="15" x2="22" y2="15" />
  </svg>
)

interface ComponentDefinition {
  type: string
  name: string
  icon: React.ElementType
  value?: string
  footprint: any
  source?: "kicad" | "custom" | "api"
  description?: string
}

const getIconForType = (type: string): React.ElementType => {
  switch (type) {
    case "resistor":
      return Resistor
    case "capacitor":
      return Capacitor
    case "inductor":
      return Circle
    case "diode":
      return Diode
    case "transistor":
      return Transistor
    case "ic":
      return Chip
    case "led":
      return Lightbulb
    case "switch":
      return ToggleLeft
    case "voltmeter":
      return Gauge
    case "ammeter":
      return Gauge
    case "oscilloscope":
      return Gauge
    case "power_supply":
      return Power
    case "ground":
      return Square
    case "connector":
      return Square
    case "potentiometer":
      return Wrench
    case "fuse":
      return Zap
    case "relay":
      return Fan
    case "transformer":
      return Battery
    default:
      return Square
  }
}

function DraggableComponent({ component }: { component: ComponentDefinition }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "CIRCUIT_COMPONENT",
    item: {
      type: component.type,
      name: component.name,
      value: component.value,
      footprint: component.footprint,
      connections: [],
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const Icon = component.icon

  return (
    <motion.div
      ref={(node) => dragRef(node)}
      className={`cursor-grab ${isDragging ? "opacity-50" : ""}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <SidebarMenuItem>
        <SidebarMenuButton className="text-foreground hover:bg-primary/20 hover:text-primary transition-all duration-300">
          <Icon className="h-4 w-4 text-primary" />
          <span className="truncate max-w-[120px]">{component.name}</span>
          {component.value && (
            <span className="ml-auto text-xs text-muted-foreground truncate max-w-[60px]">{component.value}</span>
          )}
          {component.source && (
            <Badge variant="outline" className="ml-2 text-xs shrink-0 bg-background/50 text-primary border-primary/30">
              {component.source}
            </Badge>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </motion.div>
  )
}

const COMPONENTS_PER_PAGE = 5

export default function ComponentSidebar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<"basic" | "active" | "measurement" | "all">("all")
  const { availableComponents, isLoading } = useCircuitComponents()
  const [localComponents, setLocalComponents] = useState<ComponentDefinition[]>([])
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    if (!isLoading && availableComponents.length > 0) {
      const mappedComponents = availableComponents.map((comp) => {
        const componentSource: "kicad" | "custom" | "api" = "kicad"
        return {
          type: comp.type,
          name: comp.name,
          icon: getIconForType(comp.type),
          value: comp.value,
          footprint: comp.footprint,
          source: componentSource,
          description: `${comp.type} component`,
        }
      })
      setLocalComponents(mappedComponents)
    }
  }, [availableComponents, isLoading])

  // Reset to first page when search term or category changes
  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm, activeCategory])

  // Filter components based on search term and active category
  const filteredComponents = localComponents.filter((component) => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeCategory === "all") return matchesSearch

    if (activeCategory === "basic") {
      return matchesSearch && ["resistor", "capacitor", "inductor", "diode"].includes(component.type)
    }

    if (activeCategory === "active") {
      return matchesSearch && ["transistor", "ic", "led", "switch"].includes(component.type)
    }

    if (activeCategory === "measurement") {
      return matchesSearch && ["voltmeter", "ammeter", "oscilloscope", "power_supply"].includes(component.type)
    }

    return matchesSearch
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredComponents.length / COMPONENTS_PER_PAGE)
  const paginatedComponents = filteredComponents.slice(
    currentPage * COMPONENTS_PER_PAGE,
    (currentPage + 1) * COMPONENTS_PER_PAGE,
  )

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <Sidebar className="border-r mt-16 bg-card/30 backdrop-blur-sm">
      <SidebarHeader className="border-b border-primary/10">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2 text-primary">Components</h2>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary" />
            <Input
              placeholder="Search components..."
              className="pl-8 bg-background/50 text-foreground border-primary/20 focus-visible:ring-primary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="p-2 flex flex-wrap gap-1">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
            className={`flex-1 transition-all duration-300 ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "border-primary/30 text-primary hover:bg-primary/20"
            }`}
          >
            All
          </Button>
          <Button
            variant={activeCategory === "basic" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("basic")}
            className={`flex-1 transition-all duration-300 ${
              activeCategory === "basic"
                ? "bg-primary text-primary-foreground"
                : "border-primary/30 text-primary hover:bg-primary/20"
            }`}
          >
            Basic
          </Button>
          <Button
            variant={activeCategory === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("active")}
            className={`flex-1 transition-all duration-300 ${
              activeCategory === "active"
                ? "bg-primary text-primary-foreground"
                : "border-primary/30 text-primary hover:bg-primary/20"
            }`}
          >
            Active
          </Button>
          <Button
            variant={activeCategory === "measurement" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("measurement")}
            className={`flex-1 transition-all duration-300 ${
              activeCategory === "measurement"
                ? "bg-primary text-primary-foreground"
                : "border-primary/30 text-primary hover:bg-primary/20"
            }`}
          >
            Measurement
          </Button>
        </div>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between text-primary">
            <span>Components</span>
            <Badge variant="outline" className="text-xs bg-background/50 text-primary border-primary/30">
              {filteredComponents.length}
            </Badge>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="text-sm text-muted-foreground p-4 text-center">Loading components...</div>
              ) : paginatedComponents.length > 0 ? (
                <>
                  {paginatedComponents.map((component, index) => (
                    <motion.div
                      key={`${component.name}-${component.value}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <DraggableComponent component={component} />
                    </motion.div>
                  ))}

                  {/* Pagination Controls */}
                  {filteredComponents.length > COMPONENTS_PER_PAGE && (
                    <div className="flex items-center justify-center p-2 mt-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevPage}
                        disabled={currentPage === 0}
                        className="w-8 h-8 p-0 border-primary/30 text-primary hover:bg-primary/20 disabled:opacity-30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-foreground">
                        {currentPage + 1} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage >= totalPages - 1}
                        className="w-8 h-8 p-0 border-primary/30 text-primary hover:bg-primary/20 disabled:opacity-30"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground p-4 text-center">No components match your search.</div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between text-primary">
            <span>KiCad Components</span>
            <Badge variant="outline" className="text-xs bg-background/50 text-primary border-primary/30">
              Library
            </Badge>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <motion.div
                animate={{
                  rotate: [0, 10, 0, -10, 0],
                  scale: [1, 1.05, 1, 1.05, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                }}
              >
                <Layers className="h-8 w-8 text-primary mb-2" />
              </motion.div>
              <div className="text-sm font-medium text-foreground">KiCad Library</div>
              <div className="text-xs text-muted-foreground mt-1">
                {isLoading ? "Loading KiCad components..." : `${availableComponents.length} components loaded`}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

