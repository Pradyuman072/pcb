"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useCircuitComponents } from "./circuit-component-context"
import { Button } from "@/components/ui/button"
import {
  Pause,
  Play,
  SkipForward,
  RotateCw,
  Trash2,
  Send,
  AlertCircle,
  Download,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Check,
  Move,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import mqtt from "mqtt"

// Constants for PCB grid - using standard 2.54mm (0.1 inch) pitch
const GRID_SIZE = 64
const CELL_SIZE = 10
const PCB_PITCH = 2.54 // mm

const MQTT_CONFIG = {
  brokerUrl: "mqtt://broker.emqx.io",
  topics: {
    publish: "esp32/matrix/data",
    subscribe: "esp32/matrix/status",
  },
  options: {
    clientId: `web-client-${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  },
}

interface PcbViewProps {
  isPrototyping: boolean
}

export default function PcbView({ isPrototyping }: PcbViewProps) {
  const { pcbComponents, connections, updatePcbComponent, removeConnection, addConnection } = useCircuitComponents()
  const [grid, setGrid] = useState<number[][]>([])
  const [currentComponent, setCurrentComponent] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [orientation, setOrientation] = useState<1 | 2>(1)
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(2)
  const [viewMode, setViewMode] = useState<"schematic" | "realistic">("realistic")
  const [sentData, setSentData] = useState<{
    componentName: string
    orientation: number
    matrix: number[][]
    timestamp: number
  } | null>(null)
  const [activeTab, setActiveTab] = useState<"send" | "data">("send")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fullMatrix, setFullMatrix] = useState<number[][]>([])
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [componentPositions, setComponentPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | null>(null)
  const [mqttStatus, setMqttStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [mqttMessages, setMqttMessages] = useState<string[]>([])
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [isMovingComponent, setIsMovingComponent] = useState(false)
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; opacity: number }>>([])
  const [shouldUpdateConnections, setShouldUpdateConnections] = useState(false)

  // Generate stars for background
  useEffect(() => {
    const newStars = Array.from({ length: 200 }, () => ({
      x: Math.random() * GRID_SIZE * CELL_SIZE,
      y: Math.random() * GRID_SIZE * CELL_SIZE,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
    }))
    setStars(newStars)
  }, [])

  // Initialize MQTT connection
  useEffect(() => {
    const connectToMqtt = async () => {
      setMqttStatus("connecting")
      setMqttMessages((prev) => [...prev, "Connecting to MQTT broker..."])

      try {
        const client = mqtt.connect(MQTT_CONFIG.brokerUrl, MQTT_CONFIG.options)

        client.on("connect", () => {
          setMqttStatus("connected")
          setMqttMessages((prev) => [...prev, "Connected to MQTT broker"])

          client.subscribe(MQTT_CONFIG.topics.subscribe, (err) => {
            if (err) {
              setMqttMessages((prev) => [...prev, `Subscription error: ${err.message}`])
            } else {
              setMqttMessages((prev) => [...prev, `Subscribed to ${MQTT_CONFIG.topics.subscribe}`])
            }
          })
        })

        client.on("error", (err: any) => {
          setMqttStatus("disconnected")
          setMqttMessages((prev) => [...prev, `Connection error: ${err.message}`])
        })

        client.on("message", (topic, message) => {
          const msg = message.toString()
          setMqttMessages((prev) => [...prev, `Message on ${topic}: ${msg}`])

          if (topic === MQTT_CONFIG.topics.subscribe && msg.includes("ACK")) {
            setMqttMessages((prev) => [...prev, "ESP32 acknowledged receipt"])
          }
        })

        client.on("close", () => {
          setMqttStatus("disconnected")
          setMqttMessages((prev) => [...prev, "Connection closed"])
        })

        client.on("reconnect", () => {
          setMqttStatus("connecting")
          setMqttMessages((prev) => [...prev, "Attempting to reconnect..."])
        })

        setMqttClient(client)
      } catch (err) {
        setMqttStatus("disconnected")
        setMqttMessages((prev) => [...prev, `Connection failed: ${err instanceof Error ? err.message : String(err)}`])
      }
    }

    connectToMqtt()

    return () => {
      if (mqttClient) {
        mqttClient.end()
        setMqttMessages((prev) => [...prev, "Disconnected from MQTT broker"])
      }
    }
  }, [])

  // Initialize grid and matrix
  const initializeGrid = useCallback(() => {
    setProcessingStatus("processing")

    const newGrid = Array(GRID_SIZE)
      .fill(0)
      .map(() => Array(GRID_SIZE).fill(0))

    const newFullMatrix = Array(GRID_SIZE)
      .fill(0)
      .map(() => Array(GRID_SIZE).fill(0))

    try {
      const newComponentPositions = { ...componentPositions }
      let positionsChanged = false

      pcbComponents.forEach((component) => {
        // Use stored position or calculate a new one based on PCB pitch
        const position = componentPositions[component.id] || {
          x: Math.floor((component.x / 2000) * GRID_SIZE),
          y: Math.floor((component.y / 2000) * GRID_SIZE),
        }

        // Snap to grid based on PCB pitch
        const gridX = Math.round(position.x / 2) * 2 // Snap to every 2 grid cells (5.08mm pitch)
        const gridY = Math.round(position.y / 2) * 2

        const adjustedX = Math.max(0, Math.min(GRID_SIZE - component.footprint.width, gridX))
        const adjustedY = Math.max(0, Math.min(GRID_SIZE - component.footprint.height, gridY))

        // Place component on grid
        const componentId = pcbComponents.findIndex((c) => c.id === component.id) + 1

        for (let j = 0; j < component.footprint.height; j++) {
          for (let i = 0; i < component.footprint.width; i++) {
            const posX = adjustedX + i
            const posY = adjustedY + j

            if (posX >= 0 && posX < GRID_SIZE && posY >= 0 && posY < GRID_SIZE) {
              newGrid[posY][posX] = componentId
            }
          }
        }

        // Place pins
        component.footprint.pins.forEach((pin: any) => {
          const pinX = adjustedX + pin.x
          const pinY = adjustedY + pin.y

          if (pinX >= 0 && pinX < GRID_SIZE && pinY >= 0 && pinY < GRID_SIZE) {
            if (pin.type === "positive") {
              newGrid[pinY][pinX] = -1
            } else if (pin.type === "negative") {
              newGrid[pinY][pinX] = -2
            }
          }
        })

        // Update component positions if changed
        if (
          newComponentPositions[component.id]?.x !== adjustedX ||
          newComponentPositions[component.id]?.y !== adjustedY
        ) {
          newComponentPositions[component.id] = { x: adjustedX, y: adjustedY }
          positionsChanged = true
        }
      })

      // Create full matrix representation
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const cell = newGrid[y][x]
          if (cell === -1) {
            newFullMatrix[y][x] = 1
          } else if (cell === -2) {
            newFullMatrix[y][x] = 2
          } else if (cell !== 0) {
            newFullMatrix[y][x] = 3
          }
        }
      }

      // Only update component positions if they've changed
      if (positionsChanged) {
        setComponentPositions(newComponentPositions)
        setShouldUpdateConnections(true)
      }

      setProcessingStatus("success")
      setGrid(newGrid)
      setFullMatrix(newFullMatrix)
    } catch (error) {
      console.error("Error initializing grid:", error)
      setProcessingStatus("error")
    }
  }, [pcbComponents, componentPositions])

  // Update connections when component positions change
  const updateConnections = useCallback(() => {
    if (!shouldUpdateConnections) return

    // First, clear all existing connections
    connections.forEach((connection) => {
      removeConnection(connection.id)
    })

    // Then recreate connections based on current component positions
    pcbComponents.forEach((startComponent) => {
      const startPos = componentPositions[startComponent.id]
      if (!startPos) return

      startComponent.connections?.forEach((endComponentId) => {
        const endComponent = pcbComponents.find((c) => c.id === endComponentId)
        const endPos = endComponent ? componentPositions[endComponent.id] : null

        if (endComponent && endPos) {
          // Find pins to connect
          const startPin = startComponent.footprint.pins[0]
          const endPin = endComponent.footprint.pins[0]

          if (startPin && endPin) {
            const startPinPos = {
              x: startPos.x + startPin.x,
              y: startPos.y + startPin.y,
            }

            const endPinPos = {
              x: endPos.x + endPin.x,
              y: endPos.y + endPin.y,
            }

            // Add the connection
            addConnection({
              start: startComponent.id,
              end: endComponent.id,
              startPos: startPinPos,
              endPos: endPinPos,
            })
          }
        }
      })
    })

    setShouldUpdateConnections(false)
  }, [pcbComponents, componentPositions, connections, removeConnection, addConnection, shouldUpdateConnections])

  useEffect(() => {
    initializeGrid()
  }, [pcbComponents, initializeGrid])

  useEffect(() => {
    if (shouldUpdateConnections) {
      const timeoutId = setTimeout(() => {
        updateConnections()
      }, 200)
      return () => clearTimeout(timeoutId)
    }
  }, [shouldUpdateConnections, updateConnections])

  // Optimized matrix data sender
  const sendMatrixData = useCallback(
    (componentName: string) => {
      if (!mqttClient || mqttStatus !== "connected") {
        setMqttMessages((prev) => [...prev, "Cannot send - MQTT not connected"])
        return false
      }

      try {
        const payload = {
          component: componentName,
          orientation,
          timestamp: Date.now(),
          matrix: fullMatrix,
        }

        mqttClient.publish(MQTT_CONFIG.topics.publish, JSON.stringify(payload), (err: any) => {
          if (err) {
            setMqttMessages((prev) => [...prev, `Failed to send ${componentName}: ${err.message}`])
            return false
          } else {
            setMqttMessages((prev) => [...prev, `Sent ${componentName} to ESP32`])
            return true
          }
        })
      } catch (err) {
        setMqttMessages((prev) => [
          ...prev,
          `Error preparing payload: ${err instanceof Error ? err.message : String(err)}`,
        ])
        return false
      }
    },
    [mqttClient, mqttStatus, orientation, fullMatrix],
  )

  const sendCurrentComponent = () => {
    if (currentComponent >= 0 && currentComponent < pcbComponents.length) {
      const component = pcbComponents[currentComponent]
      const success = sendMatrixData(component.name)

      if (success) {
        setSentData({
          componentName: component.name,
          orientation,
          matrix: fullMatrix,
          timestamp: Date.now(),
        })
      }
    }
  }

  // Automatic playback with MQTT sending
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPrototyping && isPlaying && pcbComponents.length > 0) {
      interval = setInterval(() => {
        if (currentComponent < pcbComponents.length - 1) {
          const nextComponent = currentComponent + 1
          setCurrentComponent(nextComponent)
          setProgress(((nextComponent + 1) / pcbComponents.length) * 100)

          const component = pcbComponents[nextComponent]
          const success = sendMatrixData(component.name)

          if (success) {
            setSentData({
              componentName: component.name,
              orientation,
              matrix: fullMatrix,
              timestamp: Date.now(),
            })
          }
        } else {
          setIsPlaying(false)
          setCurrentComponent(-1)
          setProgress(0)
          setSentData(null)
        }
      }, speed * 1000)
    }

    return () => clearInterval(interval)
  }, [isPrototyping, isPlaying, currentComponent, pcbComponents, speed, orientation, fullMatrix, sendMatrixData])

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      if (currentComponent === -1 || currentComponent >= pcbComponents.length - 1) {
        setCurrentComponent(0)
        setProgress((1 / pcbComponents.length) * 100)
      }
    }
  }

  const handleNext = () => {
    if (pcbComponents.length === 0) return

    if (currentComponent < pcbComponents.length - 1) {
      const nextComponent = currentComponent + 1
      setCurrentComponent(nextComponent)
      setProgress(((nextComponent + 1) / pcbComponents.length) * 100)

      const component = pcbComponents[nextComponent]
      const success = sendMatrixData(component.name)

      if (success) {
        setSentData({
          componentName: component.name,
          orientation,
          matrix: fullMatrix,
          timestamp: Date.now(),
        })
      }
    } else {
      setCurrentComponent(0)
      setProgress((1 / pcbComponents.length) * 100)
    }
  }

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === 1 ? 2 : 1))
  }

  const clearSentData = () => {
    setSentData(null)
  }

  const downloadMatrixData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullMatrix))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "matrix_data.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleResetZoom = () => {
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // If a component is selected and we're in move mode
      if (selectedComponent && isMovingComponent) {
        // Let the component move handler handle it
        return
      }

      // Otherwise handle canvas dragging
      setIsDragging(true)
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    } else if (selectedComponent && isMovingComponent) {
      // Handle component movement
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      // Calculate new position in grid coordinates
      const x = Math.round((e.clientX - rect.left - panOffset.x) / (CELL_SIZE * zoom))
      const y = Math.round((e.clientY - rect.top - panOffset.y) / (CELL_SIZE * zoom))

      // Snap to PCB grid (every 2 cells for 5.08mm pitch)
      const snappedX = Math.round(x / 2) * 2
      const snappedY = Math.round(y / 2) * 2

      // Update component position
      setComponentPositions((prev) => ({
        ...prev,
        [selectedComponent]: {
          x: Math.max(0, Math.min(GRID_SIZE - 4, snappedX)),
          y: Math.max(0, Math.min(GRID_SIZE - 4, snappedY)),
        },
      }))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)

    // If we were moving a component, update the grid
    if (selectedComponent && isMovingComponent) {
      initializeGrid()
      setIsMovingComponent(false)
    }
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    if (isMovingComponent) {
      setIsMovingComponent(false)
    }
  }

  const handleComponentClick = (componentId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (selectedComponent === componentId) {
      setSelectedComponent(null)
    } else {
      setSelectedComponent(componentId)
    }
  }

  const handleStartMoving = (componentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedComponent(componentId)
    setIsMovingComponent(true)
  }

  const handleCanvasClick = () => {
    setSelectedComponent(null)
    setIsMovingComponent(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
    const newZoom = Math.max(0.5, Math.min(3, zoom * zoomFactor))

    const newPanOffset = {
      x: mouseX - (mouseX - panOffset.x) * (newZoom / zoom),
      y: mouseY - (mouseY - panOffset.y) * (newZoom / zoom),
    }

    setZoom(newZoom)
    setPanOffset(newPanOffset)
  }

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const drawCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw starry background
      ctx.fillStyle = "#061530" // Dark blue background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      stars.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.save()
      ctx.translate(panOffset.x, panOffset.y)
      ctx.scale(zoom, zoom)

      if (viewMode === "schematic") {
        // Draw grid for schematic view
        ctx.strokeStyle = "#334155" // Slate-600
        ctx.lineWidth = 0.5

        // Draw grid lines based on PCB pitch (every 2 cells = 5.08mm)
        for (let i = 0; i <= GRID_SIZE; i += 2) {
          ctx.beginPath()
          ctx.moveTo(i * CELL_SIZE, 0)
          ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(0, i * CELL_SIZE)
          ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE)
          ctx.stroke()
        }

        if (grid.length > 0) {
          for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
              const cell = grid[y][x]

              if (cell !== 0) {
                if (cell === -1) {
                  ctx.fillStyle = "#00ff00"
                  ctx.beginPath()
                  ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2)
                  ctx.fill()
                } else if (cell === -2) {
                  ctx.fillStyle = "#ff0000"
                  ctx.beginPath()
                  ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2)
                  ctx.fill()
                } else {
                  const componentIndex = cell - 1
                  const isHighlighted = componentIndex === currentComponent && isPrototyping
                  const isSelected =
                    componentIndex >= 0 &&
                    componentIndex < pcbComponents.length &&
                    pcbComponents[componentIndex].id === selectedComponent

                  ctx.fillStyle = isHighlighted ? "#4ade80" : isSelected ? "#3b82f6" : "#888888"
                  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
                }
              }
            }
          }
        }
      } else {
        // Draw perfboard background for realistic view
        ctx.fillStyle = "#0D5C2E" // Dark green perfboard
        ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE)

        // Draw perfboard holes
        ctx.fillStyle = "#0A4A25" // Darker green for holes
        for (let i = 0; i <= GRID_SIZE; i += 2) {
          // Every 2 cells = 5.08mm pitch
          for (let j = 0; j <= GRID_SIZE; j += 2) {
            ctx.beginPath()
            ctx.arc(i * CELL_SIZE, j * CELL_SIZE, 1.5, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        if (grid.length > 0) {
          for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
              const cell = grid[y][x]

              if (cell !== 0) {
                if (cell === -1) {
                  // Positive pin
                  ctx.fillStyle = "#C0FFC0"
                  ctx.beginPath()
                  ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2)
                  ctx.fill()

                  ctx.fillStyle = "#00AA00"
                  ctx.beginPath()
                  ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2.5, 0, Math.PI * 2)
                  ctx.fill()

                  ctx.fillStyle = "#000000"
                  ctx.beginPath()
                  ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 6, 0, Math.PI * 2)
                  ctx.fill()
                } else if (cell === -2) {
                  // Negative pin
                  ctx.fillStyle = "#FFC0C0"
                  ctx.beginPath()
                  ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2)
                  ctx.fill()

                  ctx.fillStyle = "#AA0000"
                  ctx.beginPath()
                  ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2.5, 0, Math.PI * 2)
                  ctx.fill()

                  ctx.fillStyle = "#000000"
                  ctx.beginPath()
                  ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 6, 0, Math.PI * 2)
                  ctx.fill()
                } else {
                  const componentIndex = cell - 1
                  const isHighlighted = componentIndex === currentComponent && isPrototyping
                  const isSelected =
                    componentIndex >= 0 &&
                    componentIndex < pcbComponents.length &&
                    pcbComponents[componentIndex].id === selectedComponent

                  // Component body
                  ctx.fillStyle = isHighlighted ? "#A0FFC0" : isSelected ? "#A0C0FF" : "#FFFFFF"
                  ctx.fillRect(x * CELL_SIZE - 1, y * CELL_SIZE - 1, CELL_SIZE + 2, CELL_SIZE + 2)

                  ctx.fillStyle = isHighlighted ? "#80DFA0" : isSelected ? "#80A0DF" : "#303030"
                  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)

                  if (isHighlighted) {
                    ctx.fillStyle = "#60BF80"
                    ctx.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4)
                  } else if (isSelected) {
                    ctx.fillStyle = "#6080BF"
                    ctx.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4)
                  } else {
                    ctx.fillStyle = "#404040"
                    ctx.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4)
                  }
                }
              }
            }
          }
        }

        // Draw connections between components
        ctx.strokeStyle = "#F0C000" // Gold color for traces
        ctx.lineWidth = 2

        connections.forEach((connection) => {
          const startComponent = pcbComponents.find((c) => c.id === connection.start)
          const endComponent = pcbComponents.find((c) => c.id === connection.end)

          if (startComponent && endComponent) {
            const startPos = componentPositions[startComponent.id]
            const endPos = componentPositions[endComponent.id]

            if (startPos && endPos) {
              const startPin = startComponent.footprint.pins[0]
              const endPin = endComponent.footprint.pins[0]

              if (startPin && endPin) {
                const startX = (startPos.x + startPin.x) * CELL_SIZE + CELL_SIZE / 2
                const startY = (startPos.y + startPin.y) * CELL_SIZE + CELL_SIZE / 2
                const endX = (endPos.x + endPin.x) * CELL_SIZE + CELL_SIZE / 2
                const endY = (endPos.y + endPin.y) * CELL_SIZE + CELL_SIZE / 2

                // Draw connection path with right angles (Manhattan routing)
                ctx.beginPath()
                ctx.moveTo(startX, startY)

                // Determine routing path - use horizontal then vertical or vertical then horizontal
                const midX = (startX + endX) / 2
                const midY = (startY + endY) / 2

                // Choose routing based on component positions
                if (Math.abs(startX - endX) > Math.abs(startY - endY)) {
                  // Route horizontally first, then vertically
                  ctx.lineTo(midX, startY)
                  ctx.lineTo(midX, endY)
                } else {
                  // Route vertically first, then horizontally
                  ctx.lineTo(startX, midY)
                  ctx.lineTo(endX, midY)
                }

                ctx.lineTo(endX, endY)
                ctx.stroke()
              }
            }
          }
        })
      }

      ctx.restore()

      // Draw zoom indicator
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(10, 10, 60, 24)
      ctx.fillStyle = "#ffffff"
      ctx.font = "12px sans-serif"
      ctx.fillText(`${Math.round(zoom * 100)}%`, 20, 26)
    }

    requestAnimationFrame(drawCanvas)
  }, [
    grid,
    currentComponent,
    isPrototyping,
    viewMode,
    zoom,
    panOffset,
    connections,
    pcbComponents,
    componentPositions,
    selectedComponent,
    stars,
  ])

  return (
    <div className="relative h-full flex flex-col items-center">
      <div className="flex-1 overflow-hidden p-4">
        <div className="flex flex-wrap justify-between mb-4 gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={viewMode === "realistic" ? "default" : "outline"}
              onClick={() => setViewMode(viewMode === "realistic" ? "schematic" : "realistic")}
            >
              {viewMode === "realistic" ? "Realistic View" : "Schematic View"}
            </Button>

            <Button variant="outline" onClick={downloadMatrixData}>
              <Download className="h-4 w-4 mr-2" />
              Download Matrix
            </Button>

            {selectedComponent && (
              <Button
                variant={isMovingComponent ? "default" : "outline"}
                onClick={() => setIsMovingComponent(!isMovingComponent)}
              >
                <Move className="h-4 w-4 mr-2" />
                {isMovingComponent ? "Placing Component..." : "Move Component"}
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              {Math.round(zoom * 100)}%
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 3}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {pcbComponents.length === 0 ? (
          <Alert className="mb-4">
            <AlertTitle>No components in PCB view</AlertTitle>
            <AlertDescription>
              Move components from the schematic to the PCB view by selecting a component and clicking the "Move to PCB"
              button.
            </AlertDescription>
          </Alert>
        ) : processingStatus === "processing" ? (
          <div className="flex items-center justify-center h-64 border rounded-md">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Generating PCB layout...</p>
              <p className="text-sm text-muted-foreground mt-2">Placing {pcbComponents.length} components</p>
            </div>
          </div>
        ) : null}

        <div className="relative border border-border rounded-md overflow-hidden">
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className={`bg-black ${isDragging ? "cursor-grabbing" : isMovingComponent ? "cursor-move" : "cursor-grab"}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
            onClick={handleCanvasClick}
          />

          {/* Component selection overlay */}
          {pcbComponents.map((component, index) => {
            const position = componentPositions[component.id]
            if (!position) return null

            return (
              <div
                key={component.id}
                className={`absolute pointer-events-auto ${selectedComponent === component.id ? "z-20" : "z-10"}`}
                style={{
                  left: position.x * CELL_SIZE * zoom + panOffset.x,
                  top: position.y * CELL_SIZE * zoom + panOffset.y,
                  width: component.footprint.width * CELL_SIZE * zoom,
                  height: component.footprint.height * CELL_SIZE * zoom,
                  cursor: isMovingComponent && selectedComponent === component.id ? "move" : "pointer",
                }}
                onClick={(e) => handleComponentClick(component.id, e)}
                onMouseDown={
                  isMovingComponent && selectedComponent === component.id
                    ? (e) => e.stopPropagation()
                    : // Prevent canvas drag when moving
                      (e) => handleStartMoving(component.id, e)
                }
              >
                {/* Invisible overlay for component interaction */}
              </div>
            )
          })}
        </div>
      </div>

      {isPrototyping && (
        <div className="border-t p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab as any}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="send" className="flex-1">
                Send Components
              </TabsTrigger>
              <TabsTrigger value="data" className="flex-1">
                Data View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Component Sender</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentComponent >= 0 && currentComponent < pcbComponents.length
                      ? `Current: ${pcbComponents[currentComponent].name} (${orientation === 1 ? "Normal" : "Rotated"})`
                      : "Select a component to send"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleOrientation}
                    title={orientation === 1 ? "Normal Orientation" : "Rotated Orientation"}
                  >
                    {orientation === 1 ? "1" : <RotateCw className="h-4 w-4" />}
                  </Button>

                  <Button variant="outline" size="icon" onClick={handlePlayPause} disabled={pcbComponents.length === 0}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  <Button variant="outline" size="icon" onClick={handleNext} disabled={pcbComponents.length === 0}>
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="default"
                    onClick={sendCurrentComponent}
                    disabled={currentComponent < 0 || currentComponent >= pcbComponents.length}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Current
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Progress</span>
                    <span className="text-sm">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Speed</span>
                    <span className="text-sm">{speed}s per component</span>
                  </div>
                  <Slider min={0.5} max={5} step={0.5} value={[speed]} onValueChange={(value) => setSpeed(value[0])} />
                </div>
              </div>

              <ScrollArea className="h-60">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-4">
                  {pcbComponents.map((component, index) => (
                    <Card
                      key={component.id}
                      className={`cursor-pointer transition-all hover:border-primary ${currentComponent === index ? "border-primary bg-primary/5" : ""}`}
                      onClick={() => setCurrentComponent(index)}
                    >
                      <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">{component.name}</CardTitle>
                        <Badge variant={currentComponent === index ? "default" : "outline"} className="text-xs">
                          {index + 1}/{pcbComponents.length}
                        </Badge>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <div className="text-xs text-muted-foreground">
                          {component.value && <div>Value: {component.value}</div>}
                          <div>
                            Size: {component.footprint.width}x{component.footprint.height}
                          </div>
                          <div>Pins: {component.footprint.pins.length}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="data">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Data Transmission</h3>
                    <p className="text-sm text-muted-foreground">View the data being sent to the ESP32</p>
                  </div>

                  {sentData && (
                    <Button variant="outline" size="sm" onClick={clearSentData}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Data
                    </Button>
                  )}
                </div>

                <Card>
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm">MQTT Connection</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Status:</div>
                      <Badge
                        variant={
                          mqttStatus === "connected"
                            ? "default"
                            : mqttStatus === "connecting"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {mqttStatus === "connecting" && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                        {mqttStatus === "connected" && <Check className="h-3 w-3 mr-1" />}
                        {mqttStatus}
                      </Badge>
                    </div>
                    <div className="mt-2 border rounded-md p-2 h-32 overflow-y-auto text-xs space-y-1">
                      {mqttMessages.length > 0 ? (
                        mqttMessages.map((message, index) => (
                          <div key={index} className="text-muted-foreground">
                            {message}
                          </div>
                        ))
                      ) : (
                        <div className="text-muted-foreground">No MQTT messages yet</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {sentData ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4 pr-4">
                      <Card>
                        <CardHeader className="py-2 px-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-sm">Component Data</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {new Date(sentData.timestamp).toLocaleTimeString()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="py-2 px-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="font-medium">Name:</div>
                              <div>{sentData.componentName}</div>
                            </div>
                            <div>
                              <div className="font-medium">Orientation:</div>
                              <div>{sentData.orientation === 1 ? "Normal" : "Rotated"}</div>
                            </div>
                            <div className="col-span-2">
                              <div className="font-medium">Data Type:</div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">JSON</Badge>
                                <Badge variant="outline">Binary Matrix</Badge>
                                <Badge variant="default">MQTT Payload</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="py-2 px-3">
                          <CardTitle className="text-sm">Matrix Representation (64x64)</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-3">
                          <div className="bg-muted p-2 rounded-md overflow-x-auto">
                            <p className="text-xs mb-2">
                              The matrix is 64x64 in size. Showing a preview of the first 10x10 elements:
                            </p>
                            <pre className="text-xs">
                              {sentData.matrix
                                .slice(0, 10)
                                .map((row) => row.slice(0, 10).join(" "))
                                .join("\n")}
                              {"\n..."}
                            </pre>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-gray-500 mr-2"></div>
                              <span>0: Empty</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 mr-2"></div>
                              <span>1: Positive Terminal</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-red-500 mr-2"></div>
                              <span>2: Negative Terminal</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-gray-800 mr-2"></div>
                              <span>3: Component Body</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="py-2 px-3">
                          <CardTitle className="text-sm">JSON Payload</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-3">
                          <div className="bg-muted p-2 rounded-md overflow-x-auto">
                            <pre className="text-xs">
                              {JSON.stringify(
                                {
                                  component: sentData.componentName,
                                  orientation: sentData.orientation,
                                  timestamp: sentData.timestamp,
                                  matrix: "[[...]]", // Truncated for display
                                },
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border rounded-md">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Data Transmitted</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Send a component to the ESP32 to see the data transmission details here.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

