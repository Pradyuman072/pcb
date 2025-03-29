"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { fetchComponentsFromAPI } from "@/lib/api-service"

// Define types
interface Pin {
  x: number
  y: number
  type: "positive" | "negative" | "other"
}

interface Footprint {
  width: number
  height: number
  pins: Pin[]
}

export type ComponentType =
  | "resistor"
  | "capacitor"
  | "inductor"
  | "diode"
  | "transistor"
  | "ic"
  | "led"
  | "switch"
  | "voltmeter"
  | "ammeter"
  | "oscilloscope"
  | "power_supply"
  | "ground"
  | "connector"

export interface Component {
  id: string
  name: string
  type: ComponentType
  value?: string
  x: number
  y: number
  rotation: number
  connections: string[]
  footprint: Footprint
  // Additional properties for simulation
  voltage?: number
  current?: number
  power?: number
  resistance?: number
  capacitance?: number
  inductance?: number
}

interface Connection {
  id: string
  start: string
  end: string
  startPos: { x: number; y: number }
  endPos: { x: number; y: number }
}

interface CircuitComponentContextType {
  components: Component[]
  schematicComponents: Component[]
  pcbComponents: Component[]
  connections: Connection[]
  availableComponents: Component[]
  isLoading: boolean
  addComponent: (component: Omit<Component, "id">) => string
  updateComponent: (id: string, updates: Partial<Component>) => void
  updatePcbComponent: (id: string, updates: Partial<Component>) => void
  removeComponent: (id: string) => void
  moveComponentToPcb: (id: string) => void
  addConnection: (connection: Omit<Connection, "id">) => string
  removeConnection: (id: string) => void
  clearConnections: () => void
}

const CircuitComponentContext = createContext<CircuitComponentContextType | undefined>(undefined)

export function CircuitComponentProvider({ children }: { children: React.ReactNode }) {
  const [components, setComponents] = useState<Component[]>([])
  const [schematicComponents, setSchematicComponents] = useState<Component[]>([])
  const [pcbComponents, setPcbComponents] = useState<Component[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [availableComponents, setAvailableComponents] = useState<Component[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch available components from API
  useEffect(() => {
    const loadComponents = async () => {
      try {
        setIsLoading(true)
        const components = await fetchComponentsFromAPI()
        if (Array.isArray(components)) {
          setAvailableComponents(components)
        } else {
          console.error("Invalid components data received:", components)
          setAvailableComponents([])
        }
      } catch (error) {
        console.error("Failed to fetch components:", error)
        setAvailableComponents([])
      } finally {
        setIsLoading(false)
      }
    }

    loadComponents()
  }, [])

  const addComponent = useCallback((component: Omit<Component, "id">) => {
    const id = uuidv4()
    const newComponent = {
      ...component,
      id,
    }
    setComponents((prev) => [...prev, newComponent])
    setSchematicComponents((prev) => [...prev, newComponent])
    return id
  }, [])

  const updateComponent = useCallback((id: string, updates: Partial<Component>) => {
    setComponents((prev) => prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp)))
    setSchematicComponents((prev) => prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp)))
    setPcbComponents((prev) => prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp)))
  }, [])

  const updatePcbComponent = useCallback((id: string, updates: Partial<Component>) => {
    setPcbComponents((prev) => prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp)))
  }, [])

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((comp) => comp.id !== id))
    setSchematicComponents((prev) => prev.filter((comp) => comp.id !== id))
    setPcbComponents((prev) => prev.filter((comp) => comp.id !== id))

    // Also remove any connections involving this component
    setConnections((prev) => prev.filter((conn) => conn.start !== id && conn.end !== id))
  }, [])

  const moveComponentToPcb = useCallback((id: string) => {
    const component = schematicComponents.find((comp) => comp.id === id)
    if (component && !pcbComponents.some((comp) => comp.id === id)) {
      // Add to PCB components
      setPcbComponents((prev) => [...prev, component])
      console.log(`Component ${component.name} moved to PCB view`)
    }
  }, [schematicComponents, pcbComponents])

  const addConnection = useCallback((connection: Omit<Connection, "id">) => {
    const id = uuidv4()
    const newConnection = {
      ...connection,
      id,
    }
    setConnections((prev) => [...prev, newConnection])
    return id
  }, [])

  const removeConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== id))
  }, [])

  const clearConnections = useCallback(() => {
    setConnections([])
  }, [])

  return (
    <CircuitComponentContext.Provider
      value={{
        components,
        schematicComponents,
        pcbComponents,
        connections,
        availableComponents,
        isLoading,
        addComponent,
        updateComponent,
        updatePcbComponent,
        removeComponent,
        moveComponentToPcb,
        addConnection,
        removeConnection,
        clearConnections,
      }}
    >
      {children}
    </CircuitComponentContext.Provider>
  )
}

export function useCircuitComponents() {
  const context = useContext(CircuitComponentContext)
  if (context === undefined) {
    throw new Error("useCircuitComponents must be used within a CircuitComponentProvider")
  }
  return context
}