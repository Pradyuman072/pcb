"use client"

import type React from "react"

// Custom icons for electronic components

// Resistor with zigzag pattern (traditional circuit theory style)
export const ResistorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M6 12l1.5 2l3-4l3 4l3-4l1.5 2" />
  </svg>
)

// Capacitor (traditional circuit theory style)
export const CapacitorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12h8" />
    <path d="M14 12h8" />
    <path d="M10 6v12" />
    <path d="M14 6v12" />
  </svg>
)

// Polarized Capacitor (electrolytic)
export const PolarizedCapacitorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12h8" />
    <path d="M14 12h8" />
    <path d="M10 6v12" />
    <path d="M14 6v12" />
    <path d="M7 8v8" />
    <path d="M5 10h4" />
  </svg>
)

// Inductor with loops (traditional circuit theory style)
export const InductorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4 12c0-2 2-4 4-4s4 2 4 0s-2-4-4-4" />
    <path d="M8 12c0-2 2-4 4-4s4 2 4 0" />
    <path d="M12 12c0-2 2-4 4-4s4 2 4 0" />
  </svg>
)

// Diode (traditional circuit theory style)
export const DiodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12h6" />
    <path d="M16 12h6" />
    <polygon points="8 6 16 12 8 18 8 6" />
    <line x1="16" y1="6" x2="16" y2="18" />
  </svg>
)

// Zener Diode
export const ZenerDiodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12h6" />
    <path d="M16 12h6" />
    <polygon points="8 6 16 12 8 18 8 6" />
    <path d="M16 6l-2 3" />
    <path d="M16 18l2-3" />
  </svg>
)

// LED (Light Emitting Diode)
export const LEDIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12h6" />
    <path d="M16 12h6" />
    <polygon points="8 6 16 12 8 18 8 6" />
    <line x1="16" y1="6" x2="16" y2="18" />
    <path d="M18 2l2 2" />
    <path d="M20 4l2 2" />
    <path d="M19 7l2-2" />
  </svg>
)

// Transistor (BJT - NPN)
export const TransistorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="6" />
    <line x1="12" y1="6" x2="12" y2="2" />
    <line x1="6" y1="12" x2="2" y2="12" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
)

// PNP Transistor
export const PNPTransistorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="6" />
    <line x1="12" y1="6" x2="12" y2="2" />
    <line x1="6" y1="12" x2="2" y2="12" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    <line x1="9" y1="9" x2="6" y2="12" />
  </svg>
)

// MOSFET Transistor
export const MOSFETIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="8" y="6" width="8" height="12" rx="1" />
    <line x1="2" y1="12" x2="8" y2="12" />
    <line x1="16" y1="8" x2="22" y2="8" />
    <line x1="16" y1="16" x2="22" y2="16" />
    <line x1="22" y1="8" x2="22" y2="16" />
  </svg>
)

// Integrated Circuit (IC)
export const ChipIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <line x1="9" y1="4" x2="9" y2="2" />
    <line x1="15" y1="4" x2="15" y2="2" />
    <line x1="9" y1="22" x2="9" y2="20" />
    <line x1="15" y1="22" x2="15" y2="20" />
    <line x1="4" y1="9" x2="2" y2="9" />
    <line x1="4" y1="15" x2="2" y2="15" />
    <line x1="22" y1="9" x2="20" y2="9" />
    <line x1="22" y1="15" x2="20" y2="15" />
  </svg>
)

// Switch
export const SwitchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12h6" />
    <circle cx="10" cy="12" r="2" />
    <path d="M10 12l6-6" />
    <circle cx="16" cy="6" r="2" />
    <path d="M16 6h6" />
  </svg>
)

// Voltmeter (traditional circuit theory style)
export const VoltmeterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="8" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M10 9l2 3l2-3" />
    <path d="M12 12v3" />
  </svg>
)

// Ammeter (traditional circuit theory style)
export const AmmeterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="8" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M12 10v4" />
  </svg>
)

// Oscilloscope
export const OscilloscopeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="12" cy="12" r="5" />
    <path d="M9 12h6" />
    <path d="M12 9v6" />
    <path d="M3 9h2" />
    <path d="M3 15h2" />
    <path d="M19 9h2" />
    <path d="M19 15h2" />
  </svg>
)

// Battery (traditional circuit theory style)
export const BatteryIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <line x1="6" y1="7" x2="6" y2="17" strokeWidth="2" />
    <line x1="10" y1="5" x2="10" y2="19" strokeWidth="2" />
    <line x1="14" y1="7" x2="14" y2="17" strokeWidth="2" />
    <line x1="18" y1="9" x2="18" y2="15" strokeWidth="2" />
  </svg>
)

// Battery Holder
export const BatteryHolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="8" y1="6" x2="8" y2="4" />
    <line x1="16" y1="6" x2="16" y2="4" />
    <line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="22" y2="12" />
  </svg>
)

// Voltage Source (traditional circuit theory style)
export const VoltageSourceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="8" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <line x1="9" y1="9" x2="9" y2="15" />
    <line x1="15" y1="9" x2="15" y2="15" />
    <line x1="9" y1="12" x2="15" y2="12" />
  </svg>
)

// Current Source (traditional circuit theory style)
export const CurrentSourceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v8" />
    <path d="M9 11l3-3 3 3" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
  </svg>
)

// Ground (traditional circuit theory style)
export const GroundIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 4v8" />
    <path d="M5 12h14" />
    <path d="M7 16h10" />
    <path d="M9 20h6" />
  </svg>
)

// Connector
export const ConnectorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="4" y="8" width="16" height="8" rx="2" />
    <path d="M4 12h16" />
    <path d="M8 8v8" />
    <path d="M12 8v8" />
    <path d="M16 8v8" />
  </svg>
)

// Potentiometer (variable resistor)
export const PotentiometerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M6 12l1 3 2-6 2 6 2-6 2 6 2-6 1 3" />
    <path d="M12 12v-6" />
    <path d="M12 6l-3 3 6 0" />
  </svg>
)

// Fuse
export const FuseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <rect x="6" y="8" width="12" height="8" rx="2" />
    <line x1="10" y1="8" x2="14" y2="16" />
  </svg>
)

// Relay
export const RelayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <line x1="6" y1="10" x2="6" y2="14" />
    <circle cx="10" cy="12" r="2" />
    <path d="M10 12h8" />
    <circle cx="18" cy="12" r="2" />
    <path d="M6 6v-2" />
    <path d="M6 18v2" />
  </svg>
)

// Crystal/Oscillator
export const CrystalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <rect x="6" y="6" width="12" height="12" rx="1" />
    <line x1="9" y1="6" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="18" />
  </svg>
)

// Speaker
export const SpeakerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12h4l6-6v12l-6-6" />
    <path d="M15 9c1 1 1 5 0 6" />
    <path d="M18 7c2 2 2 8 0 10" />
  </svg>
)

// Transformer (completely redesigned to be more recognizable)
export const TransformerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Iron Core */}
    <rect x="11" y="2" width="2" height="20" fill="#888" stroke="none" />
    <rect x="11" y="2" width="2" height="20" fill="none" stroke="currentColor" />

    {/* Primary Coil */}
    <path d="M2 12h3" />
    <circle cx="7" cy="6" r="1.5" fill="none" />
    <circle cx="7" cy="9" r="1.5" fill="none" />
    <circle cx="7" cy="12" r="1.5" fill="none" />
    <circle cx="7" cy="15" r="1.5" fill="none" />
    <circle cx="7" cy="18" r="1.5" fill="none" />
    <line x1="7" y1="4.5" x2="7" y2="19.5" />
    <line x1="7" y1="6" x2="11" y2="6" />
    <line x1="7" y1="9" x2="11" y2="9" />
    <line x1="7" y1="12" x2="11" y2="12" />
    <line x1="7" y1="15" x2="11" y2="15" />
    <line x1="7" y1="18" x2="11" y2="18" />

    {/* Secondary Coil */}
    <path d="M19 12h3" />
    <circle cx="17" cy="6" r="1.5" fill="none" />
    <circle cx="17" cy="9" r="1.5" fill="none" />
    <circle cx="17" cy="12" r="1.5" fill="none" />
    <circle cx="17" cy="15" r="1.5" fill="none" />
    <circle cx="17" cy="18" r="1.5" fill="none" />
    <line x1="17" y1="4.5" x2="17" y2="19.5" />
    <line x1="13" y1="6" x2="17" y2="6" />
    <line x1="13" y1="9" x2="17" y2="9" />
    <line x1="13" y1="12" x2="17" y2="12" />
    <line x1="13" y1="15" x2="17" y2="15" />
    <line x1="13" y1="18" x2="17" y2="18" />
  </svg>
)

// Microphone
export const MicrophoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
)

// Function to get the appropriate icon based on component type
export const getIconForType = (type: string): React.ElementType => {
  switch (type) {
    case "resistor":
      return ResistorIcon
    case "capacitor":
      return CapacitorIcon
    case "polarized_capacitor":
      return PolarizedCapacitorIcon
    case "inductor":
      return InductorIcon
    case "diode":
      return DiodeIcon
    case "zener_diode":
      return ZenerDiodeIcon
    case "led":
      return LEDIcon
    case "transistor":
      return TransistorIcon
    case "pnp_transistor":
      return PNPTransistorIcon
    case "mosfet":
      return MOSFETIcon
    case "ic":
      return ChipIcon
    case "switch":
      return SwitchIcon
    case "voltmeter":
      return VoltmeterIcon
    case "ammeter":
      return AmmeterIcon
    case "oscilloscope":
      return OscilloscopeIcon
    case "battery":
      return BatteryIcon
    case "battery_holder":
      return BatteryHolderIcon
    case "transformer":
      return TransformerIcon
    case "voltage_source":
    case "power_supply":
      return VoltageSourceIcon
    case "current_source":
      return CurrentSourceIcon
    case "ground":
      return GroundIcon
    case "connector":
      return ConnectorIcon
    case "potentiometer":
      return PotentiometerIcon
    case "fuse":
      return FuseIcon
    case "relay":
      return RelayIcon
    case "crystal":
    case "oscillator":
      return CrystalIcon
    case "speaker":
      return SpeakerIcon
    case "microphone":
      return MicrophoneIcon
    default:
      return ChipIcon
  }
}

// Function to determine component type from name
export const getComponentTypeFromName = (name: string): string => {
  const lowerName = name.toLowerCase()

  if (lowerName.includes("resistor") || lowerName.includes("r_")) {
    return "resistor"
  } else if (lowerName.includes("capacitor") || lowerName.includes("c_")) {
    if (lowerName.includes("electrolytic") || lowerName.includes("polar")) {
      return "polarized_capacitor"
    }
    return "capacitor"
  } else if (lowerName.includes("inductor") || lowerName.includes("l_")) {
    return "inductor"
  } else if (lowerName.includes("diode") || lowerName.includes("d_")) {
    if (lowerName.includes("zener")) {
      return "zener_diode"
    }
    return "diode"
  } else if (lowerName.includes("transistor") || lowerName.includes("q_")) {
    if (lowerName.includes("pnp")) {
      return "pnp_transistor"
    } else if (lowerName.includes("mosfet") || lowerName.includes("fet")) {
      return "mosfet"
    }
    return "transistor"
  } else if (lowerName.includes("ic")) {
    return "ic"
  } else if (lowerName.includes("led")) {
    return "led"
  } else if (lowerName.includes("switch") || lowerName.includes("sw_")) {
    return "switch"
  } else if (lowerName.includes("voltmeter")) {
    return "voltmeter"
  } else if (lowerName.includes("ammeter")) {
    return "ammeter"
  } else if (lowerName.includes("oscilloscope")) {
    return "oscilloscope"
  } else if (lowerName.includes("battery")) {
    if (lowerName.includes("holder")) {
      return "battery_holder"
    }
    return "battery"
  } else if (lowerName.includes("transformer")) {
    return "transformer"
  } else if (lowerName.includes("power") || lowerName.includes("voltage source")) {
    return "voltage_source"
  } else if (lowerName.includes("current source")) {
    return "current_source"
  } else if (lowerName.includes("gnd") || lowerName.includes("ground")) {
    return "ground"
  } else if (lowerName.includes("connector") || lowerName.includes("conn_")) {
    return "connector"
  } else if (lowerName.includes("potentiometer") || lowerName.includes("pot_")) {
    return "potentiometer"
  } else if (lowerName.includes("fuse")) {
    return "fuse"
  } else if (lowerName.includes("relay")) {
    return "relay"
  } else if (lowerName.includes("crystal") || lowerName.includes("oscillator")) {
    return "crystal"
  } else if (lowerName.includes("speaker")) {
    return "speaker"
  } else if (lowerName.includes("microphone") || lowerName.includes("mic")) {
    return "microphone"
  } else {
    return "ic" // Default to IC for unknown components
  }
}
