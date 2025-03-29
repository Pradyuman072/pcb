"use client"

import React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useDrop } from "react-dnd"
import { useDrag } from "react-dnd"
import { Button } from "@/components/ui/button"
import { useCircuitComponents } from "./circuit-component-context"
import {
  Zap,
  Battery,
  Circle,
  Square,
  Cpu,
  ToggleLeft,
  Lightbulb,
  Trash2,
  RotateCw,
  MoveRight,
  Grid,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const COMPONENT_ICONS: Record<string, React.ElementType> = {
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
}

const DraggableComponent = React.memo(function DraggableComponent({
  id,
  component,
  isSelected,
  isConnecting,
  onSelect,
  onStartConnection,
  onRotate,
  onDelete,
  onMoveToPcb,
}: {
  id: string
  component: any
  isSelected: boolean
  isConnecting: boolean
  onSelect: (id: string, e: React.MouseEvent) => void
  onStartConnection: (id: string, e: React.MouseEvent) => void
  onRotate: (id: string) => void
  onDelete: (id: string) => void
  onMoveToPcb: (id: string) => void
}) {
  const Icon = COMPONENT_ICONS[component.type] || Square

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "PLACED_COMPONENT",
      item: { id },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [id],
  )

  return (
    <div
      ref={drag}
      id={id}
      className={`absolute flex items-center justify-center p-2 rounded-md cursor-move transition-all ${
        isSelected ? "ring-2 ring-primary shadow-md" : ""
      } ${isConnecting ? "ring-2 ring-blue-500 shadow-md" : ""} ${isDragging ? "opacity-50" : ""}`}
      style={{
        left: component.x,
        top: component.y,
        transform: `rotate(${component.rotation}deg)`,
        backgroundColor: isSelected ? "rgba(59, 130, 246, 0.15)" : "rgba(0, 0, 0, 0.1)",
        width: "80px",
        height: "80px",
        zIndex: isSelected ? 10 : 1,
      }}
      onClick={(e) => onSelect(id, e)}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background shadow-sm">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="text-xs mt-1 font-medium">{component.name}</div>
        {component.value && <div className="text-xs text-muted-foreground">{component.value}</div>}
      </div>

      {isSelected && (
        <TooltipProvider>
          <div className="absolute -top-10 left-0 flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 bg-background shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onStartConnection(id, e)
                  }}
                >
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Connect</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 bg-background shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRotate(id)
                  }}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rotate</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 bg-background shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveToPcb(id)
                  }}
                >
                  <MoveRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move to PCB</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 bg-background shadow-sm text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )}
    </div>
  )
})

export default function SchematicEditor() {
  const {
    schematicComponents,
    connections,
    addComponent,
    updateComponent,
    removeComponent,
    moveComponentToPcb,
    addConnection,
    removeConnection,
  } = useCircuitComponents()

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [connectionStart, setConnectionStart] = useState<{ x: number; y: number } | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const editorRef = useRef<HTMLDivElement>(null)
  const [connectionPositions, setConnectionPositions] = useState<
    Record<string, { startPos: { x: number; y: number }; endPos: { x: number; y: number } }>
  >({})

  const handleDrop = useCallback(
    (item: any, monitor: any) => {
      const offset = monitor.getClientOffset()
      if (!offset || !editorRef.current) return

      const editorRect = editorRef.current.getBoundingClientRect()
      const x = (offset.x - editorRect.left - panOffset.x) / zoom
      const y = (offset.y - editorRect.top - panOffset.y) / zoom

      if (item.id) {
        // Update component position
        updateComponent(item.id, { x, y })
      } else {
        addComponent({
          ...item,
          x,
          y,
          rotation: 0,
          connections: [],
        })
      }
    },
    [addComponent, updateComponent, zoom, panOffset],
  )

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ["CIRCUIT_COMPONENT", "PLACED_COMPONENT"],
      drop: handleDrop,
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [handleDrop],
  )

  const handleComponentClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation()

      if (connecting) {
        const startComponent = schematicComponents.find((c) => c.id === connecting)
        const endComponent = schematicComponents.find((c) => c.id === id)

        if (startComponent && endComponent && connecting !== id) {
          const startComponentEl = document.getElementById(connecting)
          const endComponentEl = document.getElementById(id)
          const editorRect = editorRef.current?.getBoundingClientRect()

          if (startComponentEl && endComponentEl && editorRect) {
            const startRect = startComponentEl.getBoundingClientRect()
            const endRect = endComponentEl.getBoundingClientRect()

            const startPos = {
              x: (startRect.left + startRect.width / 2 - editorRect.left - panOffset.x) / zoom,
              y: (startRect.top + startRect.height / 2 - editorRect.top - panOffset.y) / zoom,
            }

            const endPos = {
              x: (endRect.left + endRect.width / 2 - editorRect.left - panOffset.x) / zoom,
              y: (endRect.top + endRect.height / 2 - editorRect.top - panOffset.y) / zoom,
            }

            const connectionId = addConnection({
              start: connecting,
              end: id,
              startPos,
              endPos,
            })

            // Store connection positions for rendering
            setConnectionPositions((prev) => ({
              ...prev,
              [connectionId]: { startPos, endPos },
            }))

            // Update component connections
            updateComponent(connecting, {
              connections: [...startComponent.connections, id],
            })

            updateComponent(id, {
              connections: [...endComponent.connections, connecting],
            })
          }
        }

        setConnecting(null)
        setConnectionStart(null)
      } else {
        setSelectedComponent(id)
      }
    },
    [connecting, schematicComponents, addConnection, updateComponent, zoom, panOffset],
  )

  const startConnection = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation()
      setConnecting(id)

      const componentEl = document.getElementById(id)
      const editorRect = editorRef.current?.getBoundingClientRect()

      if (componentEl && editorRect) {
        const rect = componentEl.getBoundingClientRect()
        setConnectionStart({
          x: (rect.left + rect.width / 2 - editorRect.left - panOffset.x) / zoom,
          y: (rect.top + rect.height / 2 - editorRect.top - panOffset.y) / zoom,
        })
      }
    },
    [zoom, panOffset],
  )

  const rotateComponent = useCallback(
    (id: string) => {
      const component = schematicComponents.find((c) => c.id === id)
      if (component) {
        updateComponent(id, {
          rotation: (component.rotation + 90) % 360,
        })
      }
    },
    [schematicComponents, updateComponent],
  )

  const deleteComponent = useCallback(
    (id: string) => {
      // Find all connections involving this component
      const connectionsToRemove = connections.filter((conn) => conn.start === id || conn.end === id)

      // Remove all those connections
      connectionsToRemove.forEach((conn) => {
        removeConnection(conn.id)

        // Also remove from connectionPositions state
        setConnectionPositions((prev) => {
          const newPositions = { ...prev }
          delete newPositions[conn.id]
          return newPositions
        })
      })

      // Remove component
      removeComponent(id)

      if (selectedComponent === id) {
        setSelectedComponent(null)
      }
    },
    [connections, removeConnection, removeComponent, selectedComponent],
  )

  const moveComponentToPcbWithFeedback = useCallback(
    (id: string) => {
      const component = schematicComponents.find((c) => c.id === id)
      if (component) {
        moveComponentToPcb(id)

        const componentEl = document.getElementById(id)
        if (componentEl) {
          componentEl.classList.add("animate-pulse", "bg-green-500/20")
          setTimeout(() => {
            componentEl.classList.remove("animate-pulse", "bg-green-500/20")
          }, 1000)
        }
      }
    },
    [schematicComponents, moveComponentToPcb],
  )

  // Update connection positions when components move
  const updateConnectionPositions = useCallback(() => {
    connections.forEach((connection) => {
      const startComponentEl = document.getElementById(connection.start)
      const endComponentEl = document.getElementById(connection.end)
      const editorRect = editorRef.current?.getBoundingClientRect()

      if (startComponentEl && endComponentEl && editorRect) {
        const startRect = startComponentEl.getBoundingClientRect()
        const endRect = endComponentEl.getBoundingClientRect()

        const startPos = {
          x: (startRect.left + startRect.width / 2 - editorRect.left - panOffset.x) / zoom,
          y: (startRect.top + startRect.height / 2 - editorRect.top - panOffset.y) / zoom,
        }

        const endPos = {
          x: (endRect.left + endRect.width / 2 - editorRect.left - panOffset.x) / zoom,
          y: (endRect.top + endRect.height / 2 - editorRect.top - panOffset.y) / zoom,
        }

        setConnectionPositions((prev) => ({
          ...prev,
          [connection.id]: { startPos, endPos },
        }))
      }
    })
  }, [connections, zoom, panOffset])

  // Update connection positions when components change or move
  useEffect(() => {
    const timeoutId = setTimeout(updateConnectionPositions, 100)
    return () => clearTimeout(timeoutId)
  }, [schematicComponents, updateConnectionPositions])

  const connectionElements = useMemo(() => {
    return connections
      .map((connection) => {
        const positions = connectionPositions[connection.id]
        if (!positions) return null

        return (
          <line
            key={connection.id}
            x1={positions.startPos.x}
            y1={positions.startPos.y}
            x2={positions.endPos.x}
            y2={positions.endPos.y}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )
      })
      .filter(Boolean)
  }, [connections, connectionPositions])

  const inProgressConnection = useMemo(() => {
    if (!connecting || !connectionStart) return null
    return (
      <line
        x1={connectionStart.x}
        y1={connectionStart.y}
        x2={mousePosition.x}
        y2={mousePosition.y}
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    )
  }, [connecting, connectionStart, mousePosition])

  const handleEditorClick = useCallback(() => {
    setSelectedComponent(null)
    setConnecting(null)
    setConnectionStart(null)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (editorRef.current) {
        const editorRect = editorRef.current.getBoundingClientRect()

        if (isDragging) {
          setPanOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          })
        } else if (connectionStart) {
          setMousePosition({
            x: (e.clientX - editorRect.left - panOffset.x) / zoom,
            y: (e.clientY - editorRect.top - panOffset.y) / zoom,
          })
        }
      }
    },
    [isDragging, dragStart, connectionStart, panOffset, zoom],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.getModifierState("Space"))) {
        e.preventDefault()
        setIsDragging(true)
        setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      }
    },
    [panOffset],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()

      const rect = editorRef.current?.getBoundingClientRect()
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
    },
    [zoom, panOffset],
  )

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }, [])

  const handleResetView = useCallback(() => {
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="absolute top-4 right-4 z-10 flex gap-2 bg-background/80 backdrop-blur-sm p-1 rounded-md shadow-sm">
        <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.5}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleResetView}>
          {Math.round(zoom * 100)}%
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 3}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setShowGrid(!showGrid)}>
          <Grid className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={drop}
        className={`relative w-full h-full overflow-auto ${showGrid ? "bg-grid-pattern" : "bg-background"}`}
        onClick={handleEditorClick}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <div
          ref={editorRef}
          className="relative w-[2000px] h-[2000px]"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Draw connections */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {connectionElements}
            {inProgressConnection}
          </svg>

          {/* Components */}
          {schematicComponents.map((component) => (
            <DraggableComponent
              key={component.id}
              id={component.id}
              component={component}
              isSelected={selectedComponent === component.id}
              isConnecting={connecting === component.id}
              onSelect={handleComponentClick}
              onStartConnection={startConnection}
              onRotate={rotateComponent}
              onDelete={deleteComponent}
              onMoveToPcb={moveComponentToPcbWithFeedback}
            />
          ))}

          {isOver && <div className="absolute inset-0 bg-primary/10 pointer-events-none" />}
        </div>
      </div>
    </div>
  )
}

