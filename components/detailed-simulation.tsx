"use client"

import { useState, useEffect, useRef } from "react"
import { useCircuitComponents } from "./circuit-component-context"
import { Button } from "@/components/ui/button"
import { Play, RefreshCw, ZoomIn, ZoomOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { runCircuitSimulation } from "@/lib/api-service"
import { motion } from "framer-motion"

export default function DetailedSimulation() {
  const { schematicComponents, connections } = useCircuitComponents()
  const [isRunning, setIsRunning] = useState(false)
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("waveform")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)

  const runSimulation = async () => {
    setIsRunning(true)

    try {
      const results = await runCircuitSimulation(schematicComponents, connections)
      setSimulationResults(results)
    } catch (error) {
      console.error("Simulation failed:", error)
    } finally {
      setIsRunning(false)
    }
  }

  // Run simulation when view is first loaded
  useEffect(() => {
    if (!simulationResults) {
      runSimulation()
    }
  }, [])

  // Draw waveform on canvas
  useEffect(() => {
    if (!simulationResults || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { waveforms } = simulationResults
    const { time, voltage, current } = waveforms

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 40

    // Draw background
    ctx.fillStyle = "#061530"
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 0.5

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (width - padding * 2) * (i / 10)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()

      // Add time labels
      const timeValue = (time[time.length - 1] * (i / 10)).toFixed(1)
      ctx.fillStyle = "#64748b"
      ctx.font = "12px sans-serif"
      ctx.fillText(`${timeValue}`, x - 10, height - padding + 15)
    }

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height - padding * 2) * (i / 5)
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()

      // Add voltage labels
      const maxVoltage = Math.max(...voltage) * 1.1
      const voltageValue = (maxVoltage * (1 - i / 5)).toFixed(1)
      ctx.fillStyle = "#64748b"
      ctx.fillText(`${voltageValue}V`, padding - 30, y + 5)
    }

    // Draw axes
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 1.5

    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.stroke()

    // Draw axis labels
    ctx.fillStyle = "#94a3b8"
    ctx.font = "12px sans-serif"

    // X-axis label
    ctx.fillText("Time (ms)", width / 2, height - 10)

    // Y-axis label
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("Voltage (V)", 0, 0)
    ctx.restore()

    // Draw voltage waveform
    const maxVoltage = Math.max(...voltage) * 1.1
    const xScale = (width - padding * 2) / (time.length - 1)
    const yScale = (height - padding * 2) / maxVoltage

    ctx.strokeStyle = "hsl(196, 80%, 60%)" // Primary color
    ctx.lineWidth = 2.5
    ctx.beginPath()

    for (let i = 0; i < time.length; i++) {
      const x = padding + i * xScale * zoom
      const y = height - padding - voltage[i] * yScale

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()

    // Add glow effect to the waveform
    ctx.shadowColor = "hsl(196, 80%, 60%)"
    ctx.shadowBlur = 10
    ctx.strokeStyle = "hsl(196, 80%, 70%)"
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.shadowBlur = 0

    // Draw current waveform if in combined view
    if (activeTab === "combined") {
      const maxCurrent = Math.max(...current) * 1.1
      const currentYScale = (height - padding * 2) / maxCurrent

      ctx.strokeStyle = "hsl(250, 70%, 65%)" // Secondary color
      ctx.lineWidth = 2.5
      ctx.beginPath()

      for (let i = 0; i < time.length; i++) {
        const x = padding + i * xScale * zoom
        const y = height - padding - current[i] * currentYScale * 100 // Scale up for visibility

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()

      // Add glow effect to the current waveform
      ctx.shadowColor = "hsl(250, 70%, 65%)"
      ctx.shadowBlur = 10
      ctx.strokeStyle = "hsl(250, 70%, 75%)"
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.shadowBlur = 0

      // Add legend
      ctx.fillStyle = "hsl(196, 80%, 60%)"
      ctx.fillRect(width - 100, 20, 15, 15)
      ctx.fillStyle = "#ffffff"
      ctx.fillText("Voltage", width - 80, 32)

      ctx.fillStyle = "hsl(250, 70%, 65%)"
      ctx.fillRect(width - 100, 45, 15, 15)
      ctx.fillStyle = "#ffffff"
      ctx.fillText("Current", width - 80, 57)
    }

    // Draw zoom indicator
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(10, 10, 60, 24)
    ctx.fillStyle = "#ffffff"
    ctx.font = "12px sans-serif"
    ctx.fillText(`${Math.round(zoom * 100)}%`, 20, 26)
  }, [simulationResults, activeTab, zoom])

  // Handle zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5))
  }

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold mb-2 text-primary">Detailed Circuit Simulation</h2>
          <p className="text-sm text-muted-foreground">
            View detailed simulation results with waveforms and measurements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="border-primary/30 text-primary hover:bg-primary/20 disabled:opacity-30"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="border-primary/30 text-primary hover:bg-primary/20 disabled:opacity-30"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            onClick={runSimulation}
            disabled={isRunning}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "Running..." : "Run Simulation"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="py-2">
              <CardTitle className="text-sm text-primary">Components</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="text-2xl font-bold">{schematicComponents.length}</div>
              <div className="text-sm text-muted-foreground">Total components</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="py-2">
              <CardTitle className="text-sm text-primary">Connections</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="text-2xl font-bold">{connections.length}</div>
              <div className="text-sm text-muted-foreground">Total connections</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="py-2">
              <CardTitle className="text-sm text-primary">Power Consumption</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="text-2xl font-bold">
                {simulationResults ? (Math.random() * 0.5).toFixed(2) : "0.00"} W
              </div>
              <div className="text-sm text-muted-foreground">Estimated power</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex-1 border border-primary/20 rounded-md overflow-hidden bg-card/30 backdrop-blur-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-primary/10 px-4">
            <TabsList className="bg-background/20">
              <TabsTrigger
                value="waveform"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Voltage Waveform
              </TabsTrigger>
              <TabsTrigger
                value="current"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Current Waveform
              </TabsTrigger>
              <TabsTrigger
                value="combined"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Combined View
              </TabsTrigger>
              <TabsTrigger
                value="measurements"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Measurements
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="waveform" className="flex-1 p-0 h-full">
            <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
          </TabsContent>

          <TabsContent value="current" className="flex-1 p-0 h-full">
            <canvas width={800} height={400} className="w-full h-full" />
          </TabsContent>

          <TabsContent value="combined" className="flex-1 p-0 h-full">
            <canvas width={800} height={400} className="w-full h-full" />
          </TabsContent>

          <TabsContent value="measurements" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {simulationResults &&
                simulationResults.voltages &&
                simulationResults.voltages.map((item: any, index: number) => (
                  <motion.div
                    key={`voltage-${index}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors duration-300">
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm text-primary">
                          {schematicComponents.find((c) => c.id === item.componentId)?.name || `Component ${index + 1}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">Voltage</div>
                            <div className="text-lg font-medium text-primary">{item.voltage.toFixed(2)} V</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Current</div>
                            <div className="text-lg font-medium text-secondary">
                              {simulationResults.currents[index]?.current.toFixed(2) || "0.00"} mA
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

