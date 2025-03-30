"use client"

import { useState, useEffect } from "react"
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
import type {  ComponentType } from "./circuit-component-context"
import { useCircuitComponents } from "./circuit-component-context"
import { Zap, Battery, Circle, Square, Cpu, ToggleLeft, Lightbulb, Search, Layers } from "lucide-react"

interface ComponentDefinition {
  type: ComponentType
  name: string
  icon: React.ElementType
  value?: string
  footprint: {
    width: number
    height: number
    pins: {
      x: number
      y: number
      type: "positive" | "negative" | "other"
    }[]
  }
  source?: "kicad" | "custom" | "api"
  description?: string
}

const ICON_MAP: Record<string, React.ElementType> = {
  resistor: Zap,
  capacitor: Battery,
  inductor: Circle,
  diode: Zap,
  transistor: Square,
  ic: Cpu,
  led: Lightbulb,
  switch: ToggleLeft,
  voltmeter: Zap,
  ammeter: Circle,
  power_supply: Battery,
  connector: Layers,
  other: Layers
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
    <div ref={dragRef} className={`cursor-grab ${isDragging ? "opacity-50" : ""}`}>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Icon className="h-4 w-4" />
          <span>{component.name}</span>
          {component.value && <span className="ml-auto text-xs text-muted-foreground">{component.value}</span>}
          {component.source && (
            <Badge variant="outline" className="ml-2 text-xs">
              {component.source}
            </Badge>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </div>
  )
}

export default function ComponentSidebar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<"basic" | "active" | "measurement" | "all">("all")
  const [kicadComponents, setKicadComponents] = useState<ComponentDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const { availableComponents } = useCircuitComponents()

  useEffect(() => {
    const fetchKicadComponents = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/symbols-with-footprints')
        const data = await response.json()
        
        if (data.success) {
          const components = data.symbols.map((symbol: any) => {
            // Use footprint data if available, otherwise fall back to symbol data
            const footprintData = symbol.footprint 
              ? {
                  width: symbol.footprint.width / 10, // Scale down for UI
                  height: symbol.footprint.height / 10, // Scale down for UI
                  pins: symbol.pins.map((pin: any) => ({
                    x: pin.x / 10,
                    y: pin.y / 10,
                    type: pin.type === "power_in" ? "positive" : 
                         pin.type === "power_out" ? "negative" : "other"
                  }))
                }
              : {
                  width: 2, // Default fallback width
                  height: 2, // Default fallback height
                  pins: symbol.pins.map((pin: any) => ({
                    x: pin.x / 10,
                    y: pin.y / 10,
                    type: pin.type === "power_in" ? "positive" : 
                         pin.type === "power_out" ? "negative" : "other"
                  }))
                }

            return {
              type: symbol.type as ComponentType,
              name: symbol.name,
              icon: ICON_MAP[symbol.type] || Layers,
              value: symbol.metadata.value,
              footprint: footprintData,
              source: "kicad",
              description: symbol.metadata.description
            }
          })
          setKicadComponents(components)
        }
      } catch (error) {
        console.error("Failed to fetch KiCad components:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchKicadComponents()
  }, [])

  // Filter components based on search term and active category
  const filteredComponents = kicadComponents.filter((component) => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         component.description?.toLowerCase().includes(searchTerm.toLowerCase())

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

  return (
    <Sidebar className="border-r mt-16">
      <SidebarHeader className="border-b">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Components</h2>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="p-2 flex flex-wrap gap-1 text-black">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
            className="flex-1"
          >
            All
          </Button>
          <Button
            variant={activeCategory === "basic" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("basic")}
            className="flex-1"
          >
            Basic
          </Button>
          <Button
            variant={activeCategory === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("active")}
            className="flex-1"
          >
            Active
          </Button>
          <Button
            variant={activeCategory === "measurement" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("measurement")}
            className="flex-1"
          >
            Measurement
          </Button>
        </div>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Components</span>
            <Badge variant="outline" className="text-xs">
              {filteredComponents.length}
            </Badge>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <div className="text-sm text-muted-foreground p-4 text-center">Loading components...</div>
              ) : filteredComponents.length > 0 ? (
                filteredComponents.map((component) => (
                  <DraggableComponent key={`${component.name}-${component.type}`} component={component} />
                ))
              ) : (
                <div className="text-sm text-muted-foreground p-4 text-center">No components match your search.</div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>KiCad Components</span>
            <Badge variant="outline" className="text-xs">
              Library
            </Badge>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Layers className="h-8 w-8 text-muted-foreground mb-2" />
              <div className="text-sm font-medium">KiCad Library</div>
              <div className="text-xs text-muted-foreground mt-1">
                {loading ? "Connecting..." : `${kicadComponents.length} components loaded`}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}