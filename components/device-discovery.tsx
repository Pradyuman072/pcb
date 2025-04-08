import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Wifi } from "lucide-react";

interface Device {
  ip: string;
  mqtt_server: string;
  mqtt_topic_prefix: string;
  device_name: string;
  device_id: string;
}

interface DeviceDiscoveryProps {
  onDeviceSelected: (device: Device) => void;
}

export function DeviceDiscovery({ onDeviceSelected }: DeviceDiscoveryProps) {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [manualIp, setManualIp] = useState("");
  const [error, setError] = useState("");

  // Function to scan local network for ESP32 devices
  const scanNetwork = async () => {
    setScanning(true);
    setDevices([]);
    setError("");
    
    // This is a simplified scan - in production you'd use mDNS or similar
    // We'll scan common IP ranges assuming ESP32 is on local network
    const foundDevices: Device[] = [];
    const baseIps = ["192.168.1", "192.168.0", "10.0.0"];
    
    // For demo, we'll just try the last few addresses in each subnet
    // In a real app, you'd use proper network discovery
    for (const baseIp of baseIps) {
      for (let i = 1; i <= 10; i++) {
        const ip = `${baseIp}.${i}`;
        try {
          const response = await fetch(`http://${ip}/api/config`, { 
            signal: AbortSignal.timeout(500) // Short timeout to prevent hanging
          });
          
          if (response.ok) {
            const data = await response.json();
            foundDevices.push({
              ip,
              mqtt_server: data.mqtt_server,
              mqtt_topic_prefix: data.mqtt_topic_prefix,
              device_name: data.device_name,
              device_id: data.device_id
            });
          }
        } catch (e) {
          // Silently fail for devices that don't respond
        }
      }
    }
    
    setDevices(foundDevices);
    setScanning(false);
    
    if (foundDevices.length === 0) {
      setError("No devices found. Try entering IP manually.");
    }
  };

  // Function to check a manually entered IP
  const checkManualIp = async () => {
    setScanning(true);
    setError("");
    
    try {
      const response = await fetch(`http://${manualIp}/api/config`);
      
      if (response.ok) {
        const data = await response.json();
        const device = {
          ip: manualIp,
          mqtt_server: data.mqtt_server,
          mqtt_topic_prefix: data.mqtt_topic_prefix,
          device_name: data.device_name,
          device_id: data.device_id
        };
        
        setDevices([device]);
      } else {
        setError("Device at this IP doesn't appear to be an ESP32 LED Matrix");
      }
    } catch (e) {
      setError("Couldn't connect to device. Check the IP and ensure you're on the same network.");
    }
    
    setScanning(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Find Your ESP32 LED Matrix</CardTitle>
        <CardDescription>
          Connect to your ESP32 LED Matrix controller to send patterns
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button 
            onClick={scanNetwork} 
            disabled={scanning}
            className="flex-1"
          >
            {scanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Scan for Devices
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-end space-x-2">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="manualIp">Or enter device IP manually</Label>
            <Input 
              type="text" 
              id="manualIp" 
              placeholder="192.168.1.x" 
              value={manualIp}
              onChange={(e) => setManualIp(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={checkManualIp}
            disabled={!manualIp || scanning}
          >
            Connect
          </Button>
        </div>
        
        {error && <p className="text-sm text-red-500">{error}</p>}
        
        {devices.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Found Devices:</h3>
            {devices.map((device, i) => (
              <div 
                key={i} 
                className="border rounded-md p-3 cursor-pointer hover:border-primary"
                onClick={() => onDeviceSelected(device)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{device.device_name}</p>
                    <p className="text-sm text-muted-foreground">IP: {device.ip}</p>
                    <p className="text-xs text-muted-foreground">
                      MQTT: {device.mqtt_server} | Topic: {device.mqtt_topic_prefix}
                    </p>
                  </div>
                  <Wifi className="h-4 w-4 text-primary" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        Make sure your device and computer are on the same network
      </CardFooter>
    </Card>
  );
}