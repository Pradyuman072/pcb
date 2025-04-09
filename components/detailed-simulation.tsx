"use client"

import { useState, useRef } from "react"
import { useCircuitComponents } from "./circuit-component-context"
import { Button } from "@/components/ui/button"
import { Play, RefreshCw, ZoomIn, ZoomOut, Info, Zap, Activity, Gauge } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { getIconForType } from "./CustomIcons"
import { useSimulation } from "./simulation-service"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface ComponentValues {
  voltage: string | number | { primary: string; secondary: string }
  current: string | number | { primary: string; secondary: string; base?: string; collector?: string; emitter?: string }
  power?: string | number | { input: string; output: string }
  resistance?: string | number
  temperature: string | number
  efficiency: string | number
  status: string
  charge?: string
  leakage?: string
  energy?: string
  inductance?: string
  luminosity?: string
  gain?: string
  ratio?: string
  internal_resistance?: string
}

export default function InteractiveSimulation() {
  const { schematicComponents, connections } = useCircuitComponents()
  const [isRunning, setIsRunning] = useState(false)
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const [simulationActive, setSimulationActive] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const simulationRef = useRef<HTMLDivElement>(null)
  const { runSimulation } = useSimulation()
  const [activeTab, setActiveTab] = useState("overview")
  const [simulationTime, setSimulationTime] = useState(0)

  // Function to run the simulation without checking connections
  const handleRunSimulation = async () => {
    setIsRunning(true)
    setSimulationTime(0)

    // Simulate progress
    const interval = setInterval(() => {
      setSimulationTime((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    try {
      // Generate mock simulation results without checking connections
      const mockResults = {
        success: true,
        voltages: schematicComponents.map((comp) => ({
          componentId: comp.id,
          voltage: Math.random() * 12,
        })),
        currents: schematicComponents.map((comp) => ({
          componentId: comp.id,
          current: Math.random() * 0.5,
        })),
        waveforms: {
          time: Array.from({ length: 100 }, (_, i) => i / 10),
          voltage: Array.from({ length: 100 }, () => Math.random() * 5),
        },
      }

      // Wait a bit to simulate processing time
      setTimeout(() => {
        setSimulationResults(mockResults)
        setSimulationActive(true)
        clearInterval(interval)
        setSimulationTime(100)
        setIsRunning(false)
      }, 2000)
    } catch (error) {
      console.error("Simulation failed:", error)
      clearInterval(interval)
      setIsRunning(false)
    }
  }

  // Handle component selection
  const handleComponentClick = (componentId: string) => {
    if (simulationActive) {
      if (selectedComponent === componentId) {
        setSelectedComponent(null)
      } else {
        setSelectedComponent(componentId)
      }
    }
  }

  // Handle zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  // Generate generic simulation values based on component type
  const getGenericComponentValues = (component: any): ComponentValues => {
    const baseValues: ComponentValues = {
      voltage: "0",
      current: "0",
      power: "0",
      resistance: "0",
      temperature: "25",
      efficiency: "0",
      status: "Inactive",
    }

    if (!simulationActive) return baseValues

    // Generate pseudo-random but consistent values based on component id
    const idSum = component.id.split("").reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0)
    const randomFactor = (idSum % 100) / 100

    switch (component.type) {
      case "resistor":
        return {
          voltage: (2 + randomFactor * 3).toFixed(2),
          current: ((20 + randomFactor * 30) / 1000).toFixed(3),
          power: (((2 + randomFactor * 3) * (20 + randomFactor * 30)) / 1000).toFixed(2),
          resistance: component.resistance || (1000 * (1 + randomFactor)).toFixed(0),
          temperature: (25 + randomFactor * 15).toFixed(1),
          efficiency: "N/A",
          status: "Normal",
        }
      case "capacitor":
        return {
          voltage: (3 + randomFactor * 2).toFixed(2),
          current: ((5 + randomFactor * 10) / 1000).toFixed(3),
          charge: ((component.capacitance || 0.000001) * (3 + randomFactor * 2) * 1000000).toFixed(2),
          leakage: (0.01 + randomFactor * 0.05).toFixed(3),
          temperature: (25 + randomFactor * 5).toFixed(1),
          efficiency: "N/A",
          status: "Charging",
        }
      case "inductor":
        return {
          voltage: (1 + randomFactor * 2).toFixed(2),
          current: ((50 + randomFactor * 100) / 1000).toFixed(3),
          energy: (0.5 * (component.inductance || 0.01) * Math.pow((50 + randomFactor * 100) / 1000, 2) * 1000).toFixed(
            2,
          ),
          inductance: component.inductance || (0.01 * (1 + randomFactor)).toFixed(3),
          temperature: (25 + randomFactor * 10).toFixed(1),
          efficiency: "N/A",
          status: "Normal",
        }
      case "diode":
        return {
          voltage: (0.7 + randomFactor * 0.3).toFixed(2),
          current: ((10 + randomFactor * 40) / 1000).toFixed(3),
          power: (((0.7 + randomFactor * 0.3) * (10 + randomFactor * 40)) / 1000).toFixed(2),
          temperature: (25 + randomFactor * 20).toFixed(1),
          efficiency: "N/A",
          status: "Conducting",
        }
      case "led":
        return {
          voltage: (2.1 + randomFactor * 0.7).toFixed(2),
          current: ((15 + randomFactor * 5) / 1000).toFixed(3),
          power: (((2.1 + randomFactor * 0.7) * (15 + randomFactor * 5)) / 1000).toFixed(2),
          luminosity: (randomFactor * 100).toFixed(0) + " lm",
          temperature: (25 + randomFactor * 15).toFixed(1),
          efficiency: (30 + randomFactor * 20).toFixed(0) + "%",
          status: "ON",
        }
      case "transistor":
        const state = randomFactor > 0.3 ? "Active" : "Cut-off"
        return {
          voltage: {
            base: (0.7 + randomFactor * 0.1).toFixed(2),
            collector: (5 + randomFactor * 3).toFixed(2),
            emitter: (0.2 + randomFactor * 0.1).toFixed(2),
          },
          current: {
            base: ((50 + randomFactor * 30) / 1000).toFixed(3),
            collector: ((5 + randomFactor * 3) / 1000).toFixed(3),
            emitter: ((5.05 + randomFactor * 3.03) / 1000).toFixed(3),
          },
          gain: (100 + randomFactor * 50).toFixed(0),
          temperature: (25 + randomFactor * 25).toFixed(1),
          efficiency: (85 + randomFactor * 10).toFixed(0) + "%",
          status: state,
        }
      case "transformer":
        return {
          voltage: {
            primary: (120 + randomFactor * 10).toFixed(1),
            secondary: (12 + randomFactor * 1).toFixed(1),
          },
          current: {
            primary: ((100 + randomFactor * 50) / 1000).toFixed(3),
            secondary: (1 + randomFactor * 0.5).toFixed(3),
          },
          power: {
            input: ((120 * (100 + randomFactor * 50)) / 1000).toFixed(2),
            output: (12 * (1 + randomFactor * 0.5)).toFixed(2),
          },
          ratio: "10:1",
          temperature: (30 + randomFactor * 20).toFixed(1),
          efficiency: (95 + randomFactor * 3).toFixed(1) + "%",
          status: "Normal",
        }
      case "power_supply":
      case "voltage_source":
      case "battery":
        return {
          voltage: component.voltage || (9 + randomFactor * 3).toFixed(1),
          current: ((200 + randomFactor * 300) / 1000).toFixed(3),
          power: ((component.voltage || 9 + randomFactor * 3) * ((200 + randomFactor * 300) / 1000)).toFixed(2),
          internal_resistance: (0.1 + randomFactor * 0.2).toFixed(2),
          temperature: (25 + randomFactor * 10).toFixed(1),
          efficiency: (90 + randomFactor * 8).toFixed(1) + "%",
          status: "Active",
        }
      default:
        return {
          voltage: (5 * randomFactor).toFixed(2),
          current: ((100 * randomFactor) / 1000).toFixed(3),
          power: ((5 * randomFactor * (100 * randomFactor)) / 1000).toFixed(2),
          temperature: (25 + randomFactor * 15).toFixed(1),
          efficiency: (randomFactor * 100).toFixed(0) + "%",
          status: "Active",
        }
    }
  }

  // Render component details card
  const renderComponentDetails = (component: any) => {
    if (!component) return null

    const values = getGenericComponentValues(component)
    const Icon = getIconForType(component.type)

    return (
      <Card className="w-full bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{component.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{component.value || component.type}</p>
              </div>
            </div>
            <Badge
              variant={
                values.status === "Normal" || values.status === "Active" || values.status === "ON"
                  ? "default"
                  : "outline"
              }
            >
              {values.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="parameters" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="parameters" className="flex-1">
                Parameters
              </TabsTrigger>
              <TabsTrigger value="waveforms" className="flex-1">
                Waveforms
              </TabsTrigger>
            </TabsList>
            <TabsContent value="parameters" className="pt-4">
              {component.type === "transformer" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Primary</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-muted-foreground">Voltage:</span>
                      <span>{(values.voltage as { primary: string }).primary} V</span>
                      <span className="text-muted-foreground">Current:</span>
                      <span>{(values.current as { primary: string }).primary} A</span>
                      <span className="text-muted-foreground">Power:</span>
                      <span>{(values.power as { input: string }).input} W</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Secondary</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-muted-foreground">Voltage:</span>
                      <span>{(values.voltage as { secondary: string }).secondary} V</span>
                      <span className="text-muted-foreground">Current:</span>
                      <span>{(values.current as { secondary: string }).secondary} A</span>
                      <span className="text-muted-foreground">Power:</span>
                      <span>{(values.power as { output: string }).output} W</span>
                    </div>
                  </div>
                  <div className="col-span-2 pt-2 border-t">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-muted-foreground">Ratio:</span>
                      <span>{values.ratio}</span>
                      <span className="text-muted-foreground">Efficiency:</span>
                      <span>{values.efficiency}</span>
                      <span className="text-muted-foreground">Temperature:</span>
                      <span>{values.temperature}°C</span>
                    </div>
                  </div>
                </div>
              ) : component.type === "transistor" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Base Voltage:</span>
                    <span>{(values.voltage as { base: string }).base} V</span>
                    <span className="text-muted-foreground">Base Current:</span>
                    <span>{(values.current as { base: string }).base} A</span>
                    <span className="text-muted-foreground">Collector Voltage:</span>
                    <span>{(values.voltage as { collector: string }).collector} V</span>
                    <span className="text-muted-foreground">Collector Current:</span>
                    <span>{(values.current as { collector: string }).collector} A</span>
                    <span className="text-muted-foreground">Gain (hFE):</span>
                    <span>{values.gain}</span>
                    <span className="text-muted-foreground">Temperature:</span>
                    <span>{values.temperature}°C</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Voltage:</span>
                  <span>{values.voltage} V</span>
                  <span className="text-muted-foreground">Current:</span>
                  <span>{values.current} A</span>

                  {component.type === "resistor" && (
                    <>
                      <span className="text-muted-foreground">Resistance:</span>
                      <span>{values.resistance} Ω</span>
                    </>
                  )}

                  {component.type === "capacitor" && (
                    <>
                      <span className="text-muted-foreground">Charge:</span>
                      <span>{values.charge} μC</span>
                    </>
                  )}

                  {component.type === "inductor" && (
                    <>
                      <span className="text-muted-foreground">Energy:</span>
                      <span>{values.energy} mJ</span>
                    </>
                  )}

                  {component.type === "led" && (
                    <>
                      <span className="text-muted-foreground">Luminosity:</span>
                      <span>{values.luminosity}</span>
                    </>
                  )}

                  <span className="text-muted-foreground">Power:</span>
                  <span>{values.power} W</span>
                  <span className="text-muted-foreground">Temperature:</span>
                  <span>{values.temperature}°C</span>

                  {values.efficiency !== "N/A" && (
                    <>
                      <span className="text-muted-foreground">Efficiency:</span>
                      <span>{values.efficiency}</span>
                    </>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="waveforms" className="pt-4">
              <div className="h-[200px] w-full bg-background/50 rounded-md border border-border flex items-center justify-center">
                {component.type === "led" ? (
                  <div className="w-full h-full p-4">
                    <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
                      <rect x="0" y="0" width="300" height="150" fill="transparent" />
                      <path
                        d={`M 0,150 L 0,50 L 50,50 L 50,10 L 250,10 L 250,50 L 300,50 L 300,150 Z`}
                        fill="rgba(74, 222, 128, 0.2)"
                        stroke="#4ade80"
                        strokeWidth="1.5"
                      />
                      <text x="150" y="80" textAnchor="middle" fill="currentColor" fontSize="12">
                        LED ON State
                      </text>
                    </svg>
                  </div>
                ) : component.type === "capacitor" ? (
                  <div className="w-full h-full p-4">
                    <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
                      <rect x="0" y="0" width="300" height="150" fill="transparent" />
                      <path
                        d={`M 0,140 ${Array.from({ length: 300 }, (_, i) => `L ${i},${140 - 130 * (1 - Math.exp(-i / 50))}`).join(" ")}`}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                      />
                      <text x="150" y="80" textAnchor="middle" fill="currentColor" fontSize="12">
                        Capacitor Charging Curve
                      </text>
                    </svg>
                  </div>
                ) : component.type === "inductor" ? (
                  <div className="w-full h-full p-4">
                    <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
                      <rect x="0" y="0" width="300" height="150" fill="transparent" />
                      <path
                        d={`M 0,140 ${Array.from({ length: 300 }, (_, i) => `L ${i},${140 - 130 * (1 - Math.exp(-i / 150))}`).join(" ")}`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                      />
                      <text x="150" y="80" textAnchor="middle" fill="currentColor" fontSize="12">
                        Inductor Current Curve
                      </text>
                    </svg>
                  </div>
                ) : component.type === "transformer" ? (
                  <div className="w-full h-full p-4">
                    <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
                      <rect x="0" y="0" width="300" height="150" fill="transparent" />
                      {/* Primary waveform */}
                      <path
                        d={`M 0,75 ${Array.from({ length: 300 }, (_, i) => `L ${i},${75 - 60 * Math.sin(i / 10)}`).join(" ")}`}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                      />
                      {/* Secondary waveform */}
                      <path
                        d={`M 0,75 ${Array.from({ length: 300 }, (_, i) => `L ${i},${75 - 30 * Math.sin(i / 10)}`).join(" ")}`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="4,2"
                      />
                      <text x="150" y="30" textAnchor="middle" fill="#3b82f6" fontSize="10">
                        Primary
                      </text>
                      <text x="150" y="120" textAnchor="middle" fill="#f59e0b" fontSize="10">
                        Secondary
                      </text>
                    </svg>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-sm">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No waveform data available</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    )
  }

  // Render circuit overview
  const renderCircuitOverview = () => {
    if (!simulationActive || !simulationResults) return null

    // Count components by type
    const componentCounts = schematicComponents.reduce((acc: Record<string, number>, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1
      return acc
    }, {})

    // Calculate total power
    const totalPower = schematicComponents
      .reduce((sum, comp) => {
        const values = getGenericComponentValues(comp)
        const power = typeof values.power === "object" ? values.power.input : values.power
        return sum + Number.parseFloat((power as string) || "0")
      }, 0)
      .toFixed(2)

    // Find voltage sources
    const voltageSources = schematicComponents.filter(
      (comp) => comp.type === "power_supply" || comp.type === "voltage_source" || comp.type === "battery",
    )

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Circuit Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Total Components:</span>
              <span>{schematicComponents.length}</span>
              <span className="text-muted-foreground">Connections:</span>
              <span>{connections.length}</span>
              <span className="text-muted-foreground">Power Sources:</span>
              <span>{voltageSources.length}</span>
              <span className="text-muted-foreground">Total Power:</span>
              <span>{totalPower} W</span>
              <span className="text-muted-foreground">Circuit Status:</span>
              <Badge variant="default">Active</Badge>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Component Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(componentCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <span className="capitalize">{type.replace("_", " ")}s</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(count / schematicComponents.length) * 100} className="h-2 w-24" />
                      <span>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Power Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {voltageSources.map((source) => {
                const values = getGenericComponentValues(source)
                return (
                  <div key={source.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{source.name}</span>
                      <Badge variant="outline">{values.voltage} V</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1 text-xs">
                      <span className="text-muted-foreground">Current Draw:</span>
                      <span>{values.current} A</span>
                      <span className="text-muted-foreground">Power Output:</span>
                      <span>{typeof values.power === "object" ? values.power.output : values.power} W</span>
                      <span className="text-muted-foreground">Efficiency:</span>
                      <span>{values.efficiency}</span>
                    </div>
                  </div>
                )
              })}

              {voltageSources.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Gauge className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No power sources in circuit</p>
                </div>
              )}

              <div className="pt-4 border-t mt-4">
                <h4 className="text-sm font-medium mb-2">Power Distribution</h4>
                <div className="h-[100px] w-full bg-background/50 rounded-md border border-border p-2">
                  <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <rect x="0" y="0" width="300" height="100" fill="transparent" />
                    {schematicComponents
                      .filter((c) => c.type !== "power_supply" && c.type !== "voltage_source" && c.type !== "battery")
                      .map((comp, i, arr) => {
                        const values = getGenericComponentValues(comp)
                        const power = typeof values.power === "object" ? values.power.input : values.power
                        const powerRatio = Number.parseFloat(power as string) / Number.parseFloat(totalPower)
                        const width = 300 / arr.length
                        const height = powerRatio * 80
                        const x = i * width

                        return (
                          <g key={comp.id}>
                            <rect
                              x={x}
                              y={100 - height}
                              width={width - 2}
                              height={height}
                              fill={`hsl(${(i * 30) % 360}, 70%, 60%)`}
                              opacity="0.7"
                            />
                            <text
                              x={x + width / 2}
                              y={95 - height}
                              textAnchor="middle"
                              fill="currentColor"
                              fontSize="8"
                            >
                              {comp.type}
                            </text>
                          </g>
                        )
                      })}
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render component list
  const renderComponentList = () => {
    if (!simulationActive || !simulationResults) return null

    return (
      <div className="grid grid-cols-1 gap-2">
        {schematicComponents.map((component) => {
          const values = getGenericComponentValues(component)
          const Icon = getIconForType(component.type)
          const isSelected = selectedComponent === component.id

          return (
            <motion.div
              key={component.id}
              className={`p-3 border rounded-md cursor-pointer transition-all ${
                isSelected ? "bg-primary/10 border-primary" : "bg-card/80 border-border hover:border-primary/50"
              }`}
              onClick={() => handleComponentClick(component.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isSelected ? "bg-primary/20" : "bg-background"}`}>
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{component.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{component.value || component.type}</p>
                </div>
                <div className="text-right">
                  {component.type === "transformer" ? (
                    <div>
                      <div className="text-sm font-medium">
                        {(values.voltage as { primary: string }).primary}V →{" "}
                        {(values.voltage as { secondary: string }).secondary}V
                      </div>
                      <div className="text-xs text-muted-foreground">{values.efficiency} eff.</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-medium">
                        {values.voltage}V / {values.current}A
                      </div>
                      <div className="text-xs text-muted-foreground">{values.power}W</div>
                    </div>
                  )}
                </div>
                <Badge
                  variant={
                    values.status === "Normal" || values.status === "Active" || values.status === "ON"
                      ? "default"
                      : "outline"
                  }
                  className="ml-2"
                >
                  {values.status}
                </Badge>
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-primary">Interactive Circuit Simulation</h2>
          <p className="text-sm text-muted-foreground">
            {simulationActive
              ? "Explore component details and circuit behavior"
              : "Run the simulation to analyze circuit performance"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="border-primary/30 text-primary hover:bg-primary/20"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="border-primary/30 text-primary hover:bg-primary/20"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleRunSimulation}
            disabled={isRunning}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "Running..." : simulationActive ? "Reset & Run" : "Run Simulation"}
          </Button>
        </div>
      </div>

      {isRunning && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Simulating circuit behavior...</span>
            <span>{simulationTime}%</span>
          </div>
          <Progress value={simulationTime} className="h-2" />
        </div>
      )}

      {simulationActive && simulationResults && (
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="overview" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">
                Circuit Overview
              </TabsTrigger>
              <TabsTrigger value="components" className="flex-1">
                Components
              </TabsTrigger>
              <TabsTrigger value="details" className="flex-1">
                Component Details
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-auto mt-4">
              <TabsContent value="overview" className="h-full">
                {renderCircuitOverview()}
              </TabsContent>
              <TabsContent value="components" className="h-full">
                {renderComponentList()}
              </TabsContent>
              <TabsContent value="details" className="h-full">
                {selectedComponent ? (
                  renderComponentDetails(schematicComponents.find((c) => c.id === selectedComponent))
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-8">
                    <div>
                      <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Select a Component</h3>
                      <p className="text-muted-foreground max-w-md">
                        Click on any component from the list to view detailed simulation results and waveforms
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}

      {!simulationActive && !isRunning && (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-background/50 to-background/10 backdrop-blur-sm rounded-lg border border-border">
          <div className="text-center max-w-md p-8">
            <Play className="h-16 w-16 text-primary mx-auto mb-6 opacity-70" />
            <h3 className="text-2xl font-semibold mb-3">Run Simulation</h3>
            <p className="text-muted-foreground mb-6">
              Click the "Run Simulation" button to analyze your circuit and view detailed component measurements,
              waveforms, and performance metrics.
            </p>
            <Button
              onClick={handleRunSimulation}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Simulation
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
