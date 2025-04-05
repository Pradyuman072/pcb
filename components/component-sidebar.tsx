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
import { getIconForType, getComponentTypeFromName } from "./CustomIcons"



interface ComponentDefinition {
  type: string
  name: string
  icon: React.ElementType
  value?: string
  footprint: any
  source?: "kicad" | "custom" | "api"
  description?: string
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

