// src/lib/kicad-components.ts
import { 
    Zap, Battery, Circle, Square, Cpu, ToggleLeft, Lightbulb, 
    Gauge, Wifi, Server, Cctv, Plug, Speaker, Mic, 
    Thermometer, AlertCircle, HardDrive, CpuIcon
  } from 'lucide-react';
  
  export interface KicadComponent {
    type: string;
    name: string;
    description: string;
    icon: React.ElementType;
    footprint: {
      width: number;
      height: number;
      pins: {
        x: number;
        y: number;
        type: 'positive' | 'negative' | 'signal' | 'ground' | 'power';
      }[];
    };
    value?: string;
    library: string;
  }
  
  const ICON_MAP: Record<string, React.ElementType> = {
    // Passive components
    resistor: Zap,
    capacitor: Battery,
    inductor: Circle,
    potentiometer: Gauge,
    varistor: AlertCircle,
    thermistor: Thermometer,
    
    // Semiconductors
    diode: Zap,
    zener: AlertCircle,
    led: Lightbulb,
    transistor: CpuIcon,
    mosfet: CpuIcon,
    thyristor: CpuIcon,
    triac: CpuIcon,
    ic: Cpu,
    microcontroller: Cpu,
    fpga: Cpu,
    
    // Power
    voltage_regulator: Battery,
    power_supply: Battery,
    fuse: AlertCircle,
    
    // Connectors
    connector: Plug,
    header: Plug,
    socket: Plug,
    terminal: Plug,
    
    // Electromechanical
    relay: ToggleLeft,
    switch: ToggleLeft,
    button: ToggleLeft,
    motor: Circle,
    
    // Sensors
    temperature_sensor: Thermometer,
    light_sensor: Lightbulb,
    motion_sensor: Cctv,
    proximity_sensor: AlertCircle,
    pressure_sensor: Gauge,
    
    // Communication
    wifi: Wifi,
    bluetooth: Wifi,
    rf: Wifi,
    ethernet: Server,
    
    // Audio
    speaker: Speaker,
    microphone: Mic,
    buzzer: Speaker,
    
    // Default
    other: HardDrive
  };
  
  export const KICAD_COMPONENTS: KicadComponent[] = [
    // Passive Components
    {
      type: "resistor",
      name: "R",
      description: "Fixed value resistor",
      icon: ICON_MAP.resistor,
      footprint: {
        width: 6.35,
        height: 2.54,
        pins: [
          { x: 0, y: 0, type: "signal" },
          { x: 6.35, y: 0, type: "signal" }
        ]
      },
      library: "Device"
    },
    {
      type: "capacitor",
      name: "C",
      description: "Ceramic capacitor",
      icon: ICON_MAP.capacitor,
      footprint: {
        width: 5.08,
        height: 2.54,
        pins: [
          { x: 0, y: 0, type: "signal" },
          { x: 5.08, y: 0, type: "signal" }
        ]
      },
      library: "Device"
    },
    // ... (more components below)
    
    // Diodes
    {
      type: "diode",
      name: "D",
      description: "Standard diode",
      icon: ICON_MAP.diode,
      footprint: {
        width: 5.08,
        height: 2.54,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 5.08, y: 0, type: "negative" }
        ]
      },
      library: "Device"
    },
    
    // Transistors
    {
      type: "transistor",
      name: "Q",
      description: "BJT Transistor",
      icon: ICON_MAP.transistor,
      footprint: {
        width: 5.08,
        height: 5.08,
        pins: [
          { x: 0, y: 0, type: "signal" },  // Base
          { x: 2.54, y: 5.08, type: "signal" },  // Collector
          { x: 5.08, y: 0, type: "signal" }  // Emitter
        ]
      },
      library: "Transistor_BJT"
    },
    
    // ICs
    {
      type: "ic",
      name: "U",
      description: "Integrated Circuit",
      icon: ICON_MAP.ic,
      footprint: {
        width: 10.16,
        height: 7.62,
        pins: [
          { x: 0, y: 0, type: "signal" },
          { x: 0, y: 2.54, type: "signal" },
          // ... more pins for DIP package
        ]
      },
      library: "Package_DIP"
    },
    
    // Connectors
    {
      type: "connector",
      name: "J",
      description: "Header connector",
      icon: ICON_MAP.connector,
      footprint: {
        width: 7.62,
        height: 2.54,
        pins: [
          { x: 0, y: 0, type: "signal" },
          { x: 2.54, y: 0, type: "signal" },
          { x: 5.08, y: 0, type: "signal" }
        ]
      },
      library: "Connector_Generic"
    },
    
    // ... Add more components as needed
  ];
  
  // Complete list of supported component types
  export const COMPONENT_CATEGORIES = {
    passive: ["resistor", "capacitor", "inductor", "potentiometer"],
    semiconductors: ["diode", "led", "transistor", "mosfet", "ic"],
    power: ["voltage_regulator", "power_supply", "fuse"],
    connectors: ["connector", "header", "socket"],
    electromechanical: ["relay", "switch", "button"],
    sensors: [
      "temperature_sensor", 
      "light_sensor", 
      "motion_sensor",
      "proximity_sensor"
    ],
    communication: ["wifi", "bluetooth", "ethernet"],
    audio: ["speaker", "microphone", "buzzer"]
  };