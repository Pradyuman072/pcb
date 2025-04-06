"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import mqtt from "mqtt"

const MQTT_CONFIG = {
  brokerUrl: "wss://broker.emqx.io:8084/mqtt",
  topics: {
    publish: "esp32/matrix/data",
    subscribe: "esp32/matrix/status"
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
};

interface MqttManagerProps {
  matrix: number[][];
  shouldConnect: boolean;
  componentName?: string;
}

export default function MqttManager({ matrix, shouldConnect, componentName }: MqttManagerProps) {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [messages, setMessages] = useState<string[]>([]);
  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const connectionAttempts = useRef(0);
  const maxConnectionAttempts = 5;
  const isInitialMount = useRef(true);

  const matrixToString = () => {
    const matrixData = matrix.map(row => row.join(",")).join(";");
    setMessages(prev => [...prev, `[DATA] ${componentName} payload: ${matrixData.length} bytes`]);
    return matrixData;
  };

  const sendMatrix = () => {
    if (clientRef.current && status === "connected") {
      const message = matrixToString();
      setMessages(prev => [...prev, `[MQTT] Publishing to ${MQTT_CONFIG.topics.publish}`]);
      
      clientRef.current.publish(
        MQTT_CONFIG.topics.publish,
        message,
        { qos: 1, retain: false },
        (err) => {
          if (err) {
            setMessages(prev => [...prev, `[ERROR] Publish failed: ${err.message}`]);
          } else {
            setMessages(prev => [...prev, `[SUCCESS] ${componentName} data sent`]);
          }
        }
      );
    }
  };

  const setupMqttClient = () => {
    if (!shouldConnect || connectionAttempts.current >= maxConnectionAttempts) return;

    connectionAttempts.current += 1;
    setMessages(prev => [...prev, `[NETWORK] Attempt ${connectionAttempts.current}/${maxConnectionAttempts}`]);
    setStatus("connecting");

    const clientId = `web-client-${Math.random().toString(16).substr(2, 8)}`;
    const options = { ...MQTT_CONFIG.options, clientId };
    
    const mqttClient = mqtt.connect(MQTT_CONFIG.brokerUrl, options);
    clientRef.current = mqttClient;

    mqttClient.on("connect", () => {
      setStatus("connected");
      setMessages(prev => [...prev, `[NETWORK] Connected to MQTT broker`]);
      connectionAttempts.current = 0;
      mqttClient.subscribe(MQTT_CONFIG.topics.subscribe);
      sendMatrix();
    });

    mqttClient.on("reconnect", () => {
      setMessages(prev => [...prev, `[NETWORK] Reconnecting...`]);
    });

    mqttClient.on("offline", () => {
      setMessages(prev => [...prev, `[NETWORK] Connection lost`]);
      setStatus("disconnected");
    });

    mqttClient.on("message", (topic, message) => {
      setMessages(prev => [...prev, `[ESP32] ${message.toString()}`]);
    });

    mqttClient.on("error", (err) => {
      setMessages(prev => [...prev, `[ERROR] ${err.message}`]);
    });

    return mqttClient;
  };

  useEffect(() => {
    if (shouldConnect && isInitialMount.current) {
      const mqttClient = setupMqttClient();
      isInitialMount.current = false;
      return () => { mqttClient?.end(true); };
    }
  }, [shouldConnect]);

  useEffect(() => {
    if (status === "connected" && clientRef.current) {
      sendMatrix();
    }
  }, [matrix]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm">ESP32 LED Matrix:</div>
        <Badge variant={status === "connected" ? "default" : "destructive"}>
          {status === "connecting" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
          {status === "connected" && <Check className="h-3 w-3 mr-1" />}
          {status}
        </Badge>
      </div>
      
      <Alert variant="outline" className="py-2">
        <AlertCircle className="h-4 w-4 mr-1" />
        <AlertDescription className="text-xs">
          {componentName ? `${componentName} data sent via MQTT` : "Matrix data sent via MQTT to ESP32 LED display"}
        </AlertDescription>
      </Alert>
      
      <div className="flex justify-between">
        <Button 
          size="sm" 
          onClick={sendMatrix}
          disabled={status !== "connected"}
        >
          Send Matrix
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => {
            if (clientRef.current) {
              clientRef.current.end(true);
              setStatus("disconnected");
              setMessages(prev => [...prev, `[NETWORK] Disconnected`]);
              setTimeout(setupMqttClient, 1000);
            }
          }}
        >
          Reconnect
        </Button>
      </div>
      
      <div className="border rounded-md p-2 h-32 overflow-y-auto text-xs font-mono">
        {messages.map((msg, i) => <div key={i} className="text-muted-foreground">{msg}</div>)}
      </div>
    </div>
  );
}