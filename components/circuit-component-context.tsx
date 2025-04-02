"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { fetchComponentsFromAPI } from "../lib/api-service"



const fetchComponentData = async (): Promise<Component[]> => {
  try {
    
    const kicadResponse = await fetch('/component-definitions.json');
    if (!kicadResponse.ok) throw new Error('Failed to fetch KiCad component data');
    
    const kicadData = await kicadResponse.json();
    
   
    const apiData = await fetchComponentsFromAPI();
    
   
    const combined = [...kicadData, ...apiData];
    const uniqueComponents = Array.from(new Map(combined.map(item => [item.name, item])).values());
    
    return uniqueComponents.map((item: any) => ({
      id: uuidv4(),
      name: item.name,
      type: item.type as ComponentType,
      value: item.value || undefined,
      description: item.description || undefined,
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: item.footprint?.width || 2,
        height: item.footprint?.height || 2,
        pins: item.footprint?.pins || [],
        svgPath: item.footprint?.svgPath,
        schematicSymbol: item.footprint?.schematicSymbol
      },
      ...(item.resistance && { resistance: item.resistance }),
      ...(item.capacitance && { capacitance: item.capacitance }),
      ...(item.inductance && { inductance: item.inductance }),
      ...(item.voltage && { voltage: item.voltage }),
      ...(item.current && { current: item.current }),
      ...(item.keywords && { keywords: item.keywords }),
      ...(item.datasheet && { datasheet: item.datasheet }),
    }));
  } catch (error) {
    console.error('Error loading component data:', error);
    console.log('Falling back to API data only');
    const apiData = await fetchComponentsFromAPI();
    return apiData;
  }
};
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
  svgPath?: string
  schematicSymbol?: string
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
  | "potentiometer"
  | "fuse"
  | "relay"
  | "transformer"

export interface Component {
  id: string
  name: string
  type: ComponentType
  value?: string
  description?: string
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
  keywords?: string[]
  datasheet?: string
  
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
  searchComponents: (query: string) => Component[]
}

const CircuitComponentContext = createContext<CircuitComponentContextType | undefined>(undefined)

// Local component data - fallback in case fetch fails
const defaultComponents: Component[] = [
  {
    id: uuidv4(),
    name: "Resistor 1k",
    type: "resistor",
    value: "1kΩ",
    x: 0,
    y: 0,
    rotation: 0,
    connections: [],
    resistance: 1000,
    footprint: {
      width: 2,
      height: 1,
      pins: [
        { x: -1, y: 0, type: "other" },
        { x: 1, y: 0, type: "other" }
      ],
      schematicSymbol: "M-1,0 L-0.7,0 L-0.5,0.3 L-0.3,-0.3 L-0.1,0.3 L0.1,-0.3 L0.3,0.3 L0.5,-0.3 L0.7,0 L1,0"
    }
  },
  {
    id: uuidv4(),
    name: "Capacitor 1uF",
    type: "capacitor",
    value: "1μF",
    x: 0,
    y: 0,
    rotation: 0,
    connections: [],
    capacitance: 0.000001,
    footprint: {
      width: 2,
      height: 1,
      pins: [
        { x: -1, y: 0, type: "other" },
        { x: 1, y: 0, type: "other" }
      ],
      schematicSymbol: "M-1,0 L-0.3,0 M-0.3,-0.6 L-0.3,0.6 M0.3,-0.6 L0.3,0.6 M0.3,0 L1,0"
    }
  }
];

// Load component data from the public folder (where we'll store our pre-processed JSON)


export function CircuitComponentProvider({ children }: { children: React.ReactNode }) {
  const [components, setComponents] = useState<Component[]>([])
  const [schematicComponents, setSchematicComponents] = useState<Component[]>([])
  const [pcbComponents, setPcbComponents] = useState<Component[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [availableComponents, setAvailableComponents] = useState<Component[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadComponents = async () => {
      setIsLoading(true);
      const data = await fetchComponentData();
      setAvailableComponents(data);
      setIsLoading(false);
    };
    loadComponents();
  }, []);

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

  const searchComponents = useCallback((query: string) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    
    return availableComponents.filter(comp => 
      comp.name.toLowerCase().includes(lowerQuery) ||
      comp.type.toLowerCase().includes(lowerQuery) ||
      comp.value?.toLowerCase().includes(lowerQuery) ||
      comp.description?.toLowerCase().includes(lowerQuery) ||
      comp.keywords?.some(kw => kw.toLowerCase().includes(lowerQuery))
    );
  }, [availableComponents]);

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
        searchComponents
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