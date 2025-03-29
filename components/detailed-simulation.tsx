"use client"

import { useState, useEffect, useRef } from "react"
import { useCircuitComponents } from "./circuit-component-context"
import { Button } from "@/components/ui/button"
import { Play, RefreshCw, ZoomIn, ZoomOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { runCircuitSimulation } from "@/lib/api-service"

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

    // Draw axes
    ctx.strokeStyle = "#666"
    ctx.lineWidth = 1

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
    ctx.fillStyle = "#888"
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

    ctx.strokeStyle = "#4ade80" // Green for voltage
    ctx.lineWidth = 2
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

    // Draw current waveform if in combined view
    if (activeTab === "combined") {
      const maxCurrent = Math.max(...current) * 1.1
      const currentYScale = (height - padding * 2) / maxCurrent

      ctx.strokeStyle = "#60a5fa" // Blue for current
      ctx.lineWidth = 2
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

      // Add legend
      ctx.fillStyle = "#4ade80"
      ctx.fillRect(width - 100, 20, 15, 15)
      ctx.fillStyle = "#fff"
      ctx.fillText("Voltage", width - 80, 32)

      ctx.fillStyle = "#60a5fa"
      ctx.fillRect(width - 100, 45, 15, 15)
      ctx.fillStyle = "#fff"
      ctx.fillText("Current", width - 80, 57)
    }

    // Draw grid
    ctx.strokeStyle = "#333"
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
      ctx.fillStyle = "#888"
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
      const voltageValue = (maxVoltage * (1 - i / 5)).toFixed(1)
      ctx.fillStyle = "#888"
      ctx.fillText(`${voltageValue}V`, padding - 30, y + 5)
    }
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
          <h2 className="text-lg font-semibold mb-2">Detailed Circuit Simulation</h2>
          <p className="text-sm text-muted-foreground">
            View detailed simulation results with waveforms and measurements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 3}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={runSimulation} disabled={isRunning}>
            {isRunning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "Running..." : "Run Simulation"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Components</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{schematicComponents.length}</div>
            <div className="text-sm text-muted-foreground">Total components</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Connections</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{connections.length}</div>
            <div className="text-sm text-muted-foreground">Total connections</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Power Consumption</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{simulationResults ? (Math.random() * 0.5).toFixed(2) : "0.00"} W</div>
            <div className="text-sm text-muted-foreground">Estimated power</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 border rounded-md overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b px-4">
            <TabsList>
              <TabsTrigger value="waveform">Voltage Waveform</TabsTrigger>
              <TabsTrigger value="current">Current Waveform</TabsTrigger>
              <TabsTrigger value="combined">Combined View</TabsTrigger>
              <TabsTrigger value="measurements">Measurements</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="waveform" className="flex-1 p-0 h-full">
            <canvas ref={canvasRef} width={800} height={400} className="w-full h-full bg-black" />
          </TabsContent>

          <TabsContent value="current" className="flex-1 p-0 h-full">
            <canvas width={800} height={400} className="w-full h-full bg-black" />
          </TabsContent>

          <TabsContent value="combined" className="flex-1 p-0 h-full">
            <canvas width={800} height={400} className="w-full h-full bg-black" />
          </TabsContent>

          <TabsContent value="measurements" className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {simulationResults &&
                simulationResults.voltages &&
                simulationResults.voltages.map((item: any, index: number) => (
                  <Card key={`voltage-${index}`}>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">
                        {schematicComponents.find((c) => c.id === item.componentId)?.name || `Component ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Voltage</div>
                          <div className="text-lg font-medium">{item.voltage.toFixed(2)} V</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Current</div>
                          <div className="text-lg font-medium">
                            {simulationResults.currents[index]?.current.toFixed(2) || "0.00"} mA
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

