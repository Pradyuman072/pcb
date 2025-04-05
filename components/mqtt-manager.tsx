"use client"

import { useState, useEffect, useRef } from "react"
import { useCircuitComponents } from "./circuit-component-context"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import mqtt from "mqtt"

const MQTT_CONFIG = {
  brokerUrl: "wss://broker.emqx.io:8084/mqtt",
  topics: {
    publish: "esp32/matrix/data",
    subscribe: "esp32/matrix/status",
    message: "esp32/message"
  },
  options: {
    clientId: `web-client-${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
    wsOptions: {
      keepalive: 60,
      reschedulePings: true,
      pingTimeout: 30000
    } as any
  },
}

export default function MqttManager() {
  const { pcbComponents } = useCircuitComponents()
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [messages, setMessages] = useState<string[]>([])
  const [sentComponents, setSentComponents] = useState<string[]>([])
  const [client, setClient] = useState<mqtt.MqttClient | null>(null)
  const [pendingComponents, setPendingComponents] = useState<string[]>([])
  const [messageText, setMessageText] = useState<string>("")
  const [messageSent, setMessageSent] = useState<boolean>(false)
  const clientRef = useRef<mqtt.MqttClient | null>(null)
  const connectionAttempts = useRef(0)
  const maxConnectionAttempts = 5

  useEffect(() => {
    let mqttClient: mqtt.MqttClient | null = null
    
    const setupMqttClient = () => {
      if (connectionAttempts.current >= maxConnectionAttempts) {
        setMessages(prev => [...prev, `Maximum connection attempts reached`])
        setStatus("disconnected")
        return
      }
      
      connectionAttempts.current += 1
      
      if (clientRef.current) {
        try { clientRef.current.end(true) } catch (e) { console.error(e) }
      }
      
      setStatus("connecting")
      
      const clientId = `web-client-${Math.random().toString(16).substr(2, 8)}`
      const options = { ...MQTT_CONFIG.options, clientId }
      
      mqttClient = mqtt.connect(MQTT_CONFIG.brokerUrl, options)
      clientRef.current = mqttClient
      
      mqttClient.on("connect", () => {
        setStatus("connected")
        connectionAttempts.current = 0
        setMessages(prev => [...prev, `Connected as ${clientId}`])
        mqttClient?.subscribe(MQTT_CONFIG.topics.subscribe)
      })
      
      mqttClient.on("message", (topic, message) => {
        const msg = message.toString()
        setMessages(prev => [...prev, `[${topic}] ${msg}`])
        
        if (msg.startsWith("ACK:")) {
          const componentName = msg.substring(4).trim()
          setSentComponents(prev => [...prev, componentName])
          setPendingComponents(prev => prev.filter(n => n !== componentName))
        }
      })
      
      mqttClient.on("error", (err) => setMessages(prev => [...prev, `Error: ${err.message}`]))
      mqttClient.on("close", () => setStatus("disconnected"))
      mqttClient.on("offline", () => setStatus("disconnected"))
      
      setClient(mqttClient)
    }
    
    setupMqttClient()
    return () => { mqttClient?.end(true) }
  }, [])

  const generateMatrixString = (component: any) => {
    const matrix = Array(64).fill(0).map(() => Array(64).fill(0))
    
    // Component-specific patterns
    switch(component.type) {
      case "resistor":
        for (let x = 25; x < 40; x++) matrix[32][x] = 4  // Body
        matrix[32][24] = 1  // Positive
        matrix[32][40] = 2  // Negative
        break
      case "capacitor":
        for (let y = 28; y < 36; y++) {
          matrix[y][30] = 4  // Left plate
          matrix[y][34] = 4  // Right plate
        }
        matrix[32][28] = 1  // Positive
        matrix[32][36] = 2  // Negative
        break
      case "led":
        for (let dx = -1; dx <= 1; dx++) 
          for (let dy = -1; dy <= 1; dy++) 
            matrix[32+dy][32+dx] = 4  // LED body
        matrix[30][30] = 1  // Anode
        matrix[34][34] = 2  // Cathode
        break
    }
    
    // Clear center point
    matrix[32][32] = 0
    
    return `${component.name}|${component.type}|` +
      matrix.map(row => row.join(',')).join(';')
  }

  const sendComponentsToESP32 = (components: any[]) => {
    components.forEach(component => {
      const matrixString = generateMatrixString(component)
      if (client?.connected) {
        setPendingComponents(prev => [...prev, component.name])
        client.publish(MQTT_CONFIG.topics.message, matrixString, { qos: 1 }, (err) => {
          if (err) {
            setMessages(prev => [...prev, `Failed to send ${component.name}`])
            setPendingComponents(prev => prev.filter(n => n !== component.name))
          }
        })
      }
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm">Connection Status:</div>
        <Badge variant={status === "connected" ? "default" : "destructive"}>
          {status.toUpperCase()}
        </Badge>
        {status === "disconnected" && (
          <Button onClick={() => window.location.reload()} size="sm">
            Reconnect
          </Button>
        )}
      </div>

      <div className="border p-2 rounded-md">
        <div className="text-sm mb-2">Component Transmission</div>
        <div className="text-xs space-y-1">
          {sentComponents.map((name, i) => (
            <div key={i} className="flex items-center text-green-500">
              <Check className="h-3 w-3 mr-1" /> {name}
            </div>
          ))}
          {pendingComponents.map((name, i) => (
            <div key={i} className="flex items-center text-yellow-500">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" /> {name}
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-md p-2 h-32 overflow-y-auto text-xs">
        {messages.map((msg, i) => (
          <div key={i} className="text-muted-foreground">{msg}</div>
        ))}
      </div>
    </div>
  )
}