"use client"

import { useState, useEffect } from "react"
import { useCircuitComponents } from "./circuit-component-context"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function MqttManager() {
  const { pcbComponents } = useCircuitComponents()
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [messages, setMessages] = useState<string[]>([])
  const [sentComponents, setSentComponents] = useState<string[]>([])

  // Simulate MQTT connection and send components when connected
  useEffect(() => {
    setStatus("connecting")

    const timer = setTimeout(() => {
      setStatus("connected")
      setMessages((prev) => [...prev, "Connected to MQTT broker at mqtt://broker.example.com:1883"])
      setMessages((prev) => [...prev, "Subscribed to topic: esp32/matrix/status"])
      setMessages((prev) => [...prev, "Publishing to topic: esp32/matrix/data"])
      
      // Send components after connection is established
      if (pcbComponents.length > 0) {
        sendComponentsToESP32()
      }
    }, 2000)

    return () => {
      clearTimeout(timer)
      setStatus("disconnected")
    }
  }, [pcbComponents])

  const sendComponentsToESP32 = () => {
    pcbComponents.forEach((component) => {
      const componentName = component.name || `Component ${component.id}`
      const message = `Sending component ${componentName} to ESP32`
      
      setMessages((prev) => [...prev, message])
      setSentComponents((prev) => [...prev, componentName])

      // Simulate sending data to ESP32
      setTimeout(() => {
        setMessages((prev) => [...prev, `Received acknowledgment from ESP32: ${componentName} data received`])
      }, 500)
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm">ESP32 Connection:</div>
        <Badge variant={status === "connected" ? "default" : status === "connecting" ? "outline" : "destructive"}>
          {status === "connecting" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
          {status === "connected" && <Check className="h-3 w-3 mr-1" />}
          {status}
        </Badge>
      </div>

      <Alert variant="outline" className="py-2">
        <AlertDescription className="text-xs">
          ESP32 is listening on topic: <span className="font-mono">esp32/matrix/data</span>
        </AlertDescription>
      </Alert>

      <div className="border rounded-md p-2 h-32 overflow-y-auto text-xs space-y-1">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className="text-muted-foreground">
              {message}
            </div>
          ))
        ) : (
          <div className="text-muted-foreground">No messages yet</div>
        )}
      </div>

      <div className="mt-2">
        <div className="text-sm mb-1">Sent Components:</div>
        <div className="text-xs space-y-1">
          {sentComponents.length > 0 ? (
            sentComponents.map((component, index) => (
              <div key={index} className="flex items-center">
                <Check className="h-3 w-3 mr-1 text-green-500" />
                <span>{component}</span>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">No components sent yet</div>
          )}
        </div>
      </div>
    </div>
  )
}