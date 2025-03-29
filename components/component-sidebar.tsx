"use client"

import type React from "react"
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
import type { CircuitComponent, ComponentType } from "./circuit-component-context"
import { useCircuitComponents } from "./circuit-component-context"
import { Zap, Battery, Circle, Square, Cpu, ToggleLeft, Lightbulb, Search, Layers } from "lucide-react"

interface ComponentDefinition {
  type: ComponentType
  name: string
  icon: React.ElementType
  value?: string
  footprint: CircuitComponent["footprint"]
  source?: "kicad" | "custom" | "api"
  description?: string
}

const CIRCUIT_COMPONENTS: ComponentDefinition[] = [
  {
    type: "resistor",
    name: "Resistor",
    icon: Zap,
    value: "1kΩ",
    footprint: {
      width: 2,
      height: 1,
      pins: [
        { x: 0, y: 0, type: "positive" },
        { x: 1, y: 0, type: "negative" },
      ],
    },
  },
  {
    type: "capacitor",
    name: "Capacitor",
    icon: Battery,
    value: "10μF",
    footprint: {
      width: 1,
      height: 2,
      pins: [
        { x: 0, y: 0, type: "positive" },
        { x: 0, y: 1, type: "negative" },
      ],
    },
  },
  {
    type: "inductor",
    name: "Inductor",
    icon: Circle,
    value: "10mH",
    footprint: {
      width: 2,
      height: 1,
      pins: [
        { x: 0, y: 0, type: "positive" },
        { x: 1, y: 0, type: "negative" },
      ],
    },
  },
  {
    type: "diode",
    name: "Diode",
    icon: Zap,
    footprint: {
      width: 1,
      height: 2,
      pins: [
        { x: 0, y: 0, type: "positive" },
        { x: 0, y: 1, type: "negative" },
      ],
    },
  },
  {
    type: "transistor",
    name: "Transistor",
    icon: Square,
    footprint: {
      width: 2,
      height: 2,
      pins: [
        { x: 0, y: 0, type: "positive" },
        { x: 1, y: 0, type: "negative" },
        { x: 0, y: 1, type: "other" },
      ],
    },
  },
  {
    type: "ic",
    name: "Integrated Circuit",
    icon: Cpu,
    footprint: {
      width: 4,
      height: 3,
      pins: [
        { x: 0, y: 0, type: "positive" },
        { x: 1, y: 0, type: "negative" },
        { x: 2, y: 0, type: "other" },
        { x: 3, y: 0, type: "other" },
        { x: 0, y: 2, type: "other" },
        { x: 1, y: 2, type: "other" },
        { x: 2, y: 2, type: "other" },
        { x: 3, y: 2, type: "other" },
      ],
    },
  },
  {
    type: "led",
    name: "LED",
    icon: Lightbulb,
    footprint: {
      width: 1,
      height: 2,
      pins: [
        { x: 0, y: 0, type: "positive" },
        { x: 0, y: 1, type: "negative" },
      ],
    },
  },
  {
    type: "switch",
    name: "Switch",
    icon: ToggleLeft,
    footprint: {
      width: 2,
      height: 1,
      pins: [
        { x: 0, y: 0, type: "positive" },
        { x: 1, y: 0, type: "negative" },
      ],
    },
  },
  {
    type: "voltmeter",
    name: "Voltmeter",
    icon: Zap,
    footprint: {
      width: 2,
      height: 2,
      pins: [
        { x: 0, y: 0, type: "positive" },
        { x: 1, y: 0, type: "negative" },
      ],
    },
  },
  {
    type: "ammeter",
    name: "Ammeter",
    icon: Circle,
    footprint: {
      width: 2,
      height: 2,
      pins: [
        { x: 0, y: 0, type: "positive" },
        { x: 1, y: 0, type: "negative" },
      ],
    },
  },
  {
    type: "power_supply",
    name: "Power Supply 5V",
    icon: Battery,
    value: "5V",
    footprint: {
      width: 2,
      height: 2,
      pins: [
        { x: 0, y: 1, type: "positive" },
        { x: 1, y: 1, type: "negative" },
      ],
    },
  },
]

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
  const { availableComponents } = useCircuitComponents()

  // Filter components based on search term and active category
  const filteredComponents = CIRCUIT_COMPONENTS.filter((component) => {
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
              {filteredComponents.length > 0 ? (
                filteredComponents.map((component) => <DraggableComponent key={component.name} component={component} />)
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
              <div className="text-xs text-muted-foreground mt-1">KiCad components will appear here when connected</div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

