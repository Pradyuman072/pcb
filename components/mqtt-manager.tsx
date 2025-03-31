"use client"

import { useState, useEffect } from "react"
import { useCircuitComponents } from "./circuit-component-context"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, AlertCircle, Wifi } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import mqtt from "mqtt"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const MQTT_CONFIG = {
  brokerUrl: "mqtt://broker.emqx.io",
  topics: {
    publish: "esp32/matrix/data",
    subscribe: "esp32/matrix/status",
    wifiConfig: "esp32/wifi/config",
  },
  options: {
    clientId: `web-client-${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  },
}

export default function MqttManager() {
  const { pcbComponents } = useCircuitComponents()
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [messages, setMessages] = useState<string[]>([])
  const [sentComponents, setSentComponents] = useState<string[]>([])
  const [client, setClient] = useState<mqtt.MqttClient | null>(null)
  const [wifiConfig, setWifiConfig] = useState({
    ssid: "",
    password: ""
  })
  const [showWifiConfig, setShowWifiConfig] = useState(false)

  // Initialize MQTT connection
  useEffect(() => {
    const connectToMqtt = async () => {
      setStatus("connecting")
      setMessages((prev) => [...prev, "Connecting to MQTT broker..."])

      try {
        const mqttClient = mqtt.connect(MQTT_CONFIG.brokerUrl, MQTT_CONFIG.options)

        mqttClient.on("connect", () => {
          setStatus("connected")
          setMessages((prev) => [...prev, "Connected to MQTT broker"])

          mqttClient.subscribe(MQTT_CONFIG.topics.subscribe, (err) => {
            if (err) {
              setMessages((prev) => [...prev, `Subscription error: ${err.message}`])
            } else {
              setMessages((prev) => [...prev, `Subscribed to ${MQTT_CONFIG.topics.subscribe}`])
            }
          })
        })

        mqttClient.on("error", (err: any) => {
          setStatus("disconnected")
          setMessages((prev) => [...prev, `Connection error: ${err.message}`])
        })

        mqttClient.on("message", (topic, message) => {
          const msg = message.toString()
          setMessages((prev) => [...prev, `Message on ${topic}: ${msg}`])

          if (topic === MQTT_CONFIG.topics.subscribe) {
            if (msg.includes("ACK")) {
              setMessages((prev) => [...prev, "ESP32 acknowledged receipt"])
            } else if (msg.includes("Wi-Fi")) {
              setMessages((prev) => [...prev, `Wi-Fi status: ${msg}`])
            }
          }
        })

        mqttClient.on("close", () => {
          setStatus("disconnected")
          setMessages((prev) => [...prev, "Connection closed"])
        })

        mqttClient.on("reconnect", () => {
          setStatus("connecting")
          setMessages((prev) => [...prev, "Attempting to reconnect..."])
        })

        setClient(mqttClient)
      } catch (err) {
        setStatus("disconnected")
        setMessages((prev) => [...prev, `Connection failed: ${err instanceof Error ? err.message : String(err)}`])
      }
    }

    connectToMqtt()

    return () => {
      if (client) {
        client.end()
        setMessages((prev) => [...prev, "Disconnected from MQTT broker"])
      }
    }
  }, [])

  // Send components to ESP32 when connected
  useEffect(() => {
    if (status === "connected" && pcbComponents.length > 0) {
      sendComponentsToESP32()
    }
  }, [status, pcbComponents])

  const sendMatrixData = (componentName: string, matrix: number[][]) => {
    if (!client || status !== "connected") {
      setMessages((prev) => [...prev, "Cannot send - MQTT not connected"])
      return false
    }

    try {
      const payload = {
        component: componentName,
        timestamp: Date.now(),
        matrix: matrix,
      }

      client.publish(
        MQTT_CONFIG.topics.publish,
        JSON.stringify(payload),
        { qos: 1 },
        (err) => {
          if (err) {
            setMessages((prev) => [...prev, `Failed to send ${componentName}: ${err.message}`])
            return false
          } else {
            setMessages((prev) => [...prev, `Sent ${componentName} to ESP32`])
            setSentComponents((prev) => [...prev, componentName])
            return true
          }
        },
      )
    } catch (err) {
      setMessages((prev) => [...prev, `Error preparing payload: ${err instanceof Error ? err.message : String(err)}`])
      return false
    }
  }

  const sendComponentsToESP32 = () => {
    pcbComponents.forEach((component) => {
      const matrix = Array(64)
        .fill(0)
        .map(() => Array(64).fill(0))

      matrix[32][32] = 1 // Center point

      const success = sendMatrixData(component.name, matrix)

      if (success) {
        setMessages((prev) => [...prev, `Prepared ${component.name} for transmission`])
      }
    })
  }

  const sendWifiConfig = () => {
    if (!client || status !== "connected") {
      setMessages((prev) => [...prev, "Cannot send Wi-Fi config - MQTT not connected"])
      return
    }

    try {
      client.publish(
        MQTT_CONFIG.topics.wifiConfig,
        JSON.stringify(wifiConfig),
        { qos: 1 },
        (err) => {
          if (err) {
            setMessages((prev) => [...prev, `Failed to send Wi-Fi config: ${err.message}`])
          } else {
            setMessages((prev) => [...prev, `Sent Wi-Fi configuration to ESP32`])
            setShowWifiConfig(false)
          }
        }
      )
    } catch (err) {
      setMessages((prev) => [...prev, `Error preparing Wi-Fi config: ${err instanceof Error ? err.message : String(err)}`])
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm">ESP32 Connection:</div>
        <Badge
          variant={status === "connected" ? "default" : status === "connecting" ? "outline" : "destructive"}
          className={status === "connected" ? "bg-primary text-primary-foreground" : ""}
        >
          {status === "connecting" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
          {status === "connected" && <Check className="h-3 w-3 mr-1" />}
          {status}
        </Badge>
      </div>

      <div className="flex gap-2">
        <Alert variant="destructive" className="py-2 bg-destructive/10 border-destructive/20 flex-1">
          <AlertDescription className="text-xs flex items-center">
            <AlertCircle className="h-3 w-3 mr-1 text-destructive" />
            ESP32 is listening on topic: <span className="font-mono ml-1 text-destructive">esp32/matrix/data</span>
          </AlertDescription>
        </Alert>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowWifiConfig(!showWifiConfig)}
          className="flex items-center gap-1"
        >
          <Wifi className="h-3 w-3" />
          <span>Wi-Fi Config</span>
        </Button>
      </div>

      {showWifiConfig && (
        <div className="border rounded-md p-3 space-y-2 bg-background/50">
          <div className="text-sm font-medium">Configure ESP32 Wi-Fi</div>
          <div className="space-y-1">
            <input
              type="text"
              placeholder="Wi-Fi SSID"
              value={wifiConfig.ssid}
              onChange={(e) => setWifiConfig({...wifiConfig, ssid: e.target.value})}
              className="w-full p-2 text-xs border rounded"
            />
            <input
              type="password"
              placeholder="Wi-Fi Password"
              value={wifiConfig.password}
              onChange={(e) => setWifiConfig({...wifiConfig, password: e.target.value})}
              className="w-full p-2 text-xs border rounded"
            />
          </div>
          <Button 
            size="sm" 
            onClick={sendWifiConfig}
            disabled={!wifiConfig.ssid}
          >
            Send Configuration
          </Button>
        </div>
      )}

      <div className="border border-border/50 rounded-md p-2 h-32 overflow-y-auto text-xs space-y-1 bg-background/50">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <motion.div
              key={index}
              className="text-muted-foreground"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </motion.div>
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
              <motion.div
                key={index}
                className="flex items-center"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Check className="h-3 w-3 mr-1 text-primary" />
                <span>{component}</span>
              </motion.div>
            ))
          ) : (
            <div className="text-muted-foreground">No components sent yet</div>
          )}
        </div>
      </div>
    </div>
  )
}