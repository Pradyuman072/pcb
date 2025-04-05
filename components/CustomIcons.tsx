"use client"

import type React from "react"

// Custom icons for electronic components
export const ResistorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12h5" />
    <path d="M17 12h5" />
    <rect x="7" y="9" width="10" height="6" rx="2" />
  </svg>
)

export const CapacitorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12h7" />
    <path d="M15 12h7" />
    <path d="M9 6v12" />
    <path d="M15 6v12" />
  </svg>
)

export const InductorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M6 12c0 0 1.5 -2 3 -2s3 4 6 4 3 -2 3 -2" />
  </svg>
)

export const DiodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 12h6" />
    <path d="M14 12h6" />
    <polygon points="10 8 14 12 10 16" />
    <line x1="14" y1="8" x2="14" y2="16" />
  </svg>
)

export const TransistorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="6" />
    <line x1="12" y1="6" x2="12" y2="2" />
    <line x1="6" y1="18" x2="6" y2="22" />
    <line x1="18" y1="18" x2="18" y2="22" />
  </svg>
)

export const ChipIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="5" y="5" width="14" height="14" rx="2" />
    <line x1="9" y1="2" x2="9" y2="5" />
    <line x1="15" y1="2" x2="15" y2="5" />
    <line x1="9" y1="19" x2="9" y2="22" />
    <line x1="15" y1="19" x2="15" y2="22" />
    <line x1="2" y1="9" x2="5" y2="9" />
    <line x1="2" y1="15" x2="5" y2="15" />
    <line x1="19" y1="9" x2="22" y2="9" />
    <line x1="19" y1="15" x2="22" y2="15" />
  </svg>
)

export const LedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 7v-4" />
    <path d="M12 21v-4" />
    <path d="M16 12h4" />
    <path d="M4 12h4" />
    <path d="M15 9l2.5-2.5" />
    <path d="M6.5 17.5l2.5-2.5" />
    <path d="M9 15l-2.5 2.5" />
    <path d="M17.5 6.5l-2.5 2.5" />
  </svg>
)

export const SwitchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12h6" />
    <path d="M16 12h6" />
    <circle cx="8" cy="12" r="2" />
    <path d="M8 12l8-5" />
  </svg>
)

export const VoltmeterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2 2" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M8 16l-1 1" />
    <path d="M16 16l1 1" />
    <path d="M8 8l-1-1" />
    <path d="M16 8l1-1" />
    <path d="M9 12h6" />
  </svg>
)

export const AmmeterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2 2" />
    <path d="M9 12h6" />
    <path d="M12 16v2" />
    <path d="M12 6v2" />
  </svg>
)

export const OscilloscopeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M4 12h2l2-5 3 10 3-7 2 2h4" />
  </svg>
)

export const PowerSupplyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 7h12v10H6z" />
    <line x1="9" y1="4" x2="9" y2="7" />
    <line x1="15" y1="4" x2="15" y2="7" />
    <line x1="12" y1="17" x2="12" y2="20" />
    <line x1="6" y1="12" x2="18" y2="12" />
  </svg>
)

export const GroundIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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

export const ConnectorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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

export const PotentiometerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="7" />
    <path d="M12 5v14" />
    <path d="M12 12l5-3" />
    <path d="M2 12h3" />
    <path d="M19 12h3" />
  </svg>
)

export const FuseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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

export const RelayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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

export const TransformerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <circle cx="8" cy="12" r="2" />
    <circle cx="16" cy="12" r="2" />
    <path d="M8 10v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v4" />
    <path d="M8 14v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-4" />
  </svg>
)

export const BuzzerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="6" />
    <path d="M12 6v12" />
    <path d="M6 12h12" />
    <path d="M16 8l4-4" />
    <path d="M16 16l4 4" />
    <path d="M8 8l-4-4" />
    <path d="M8 16l-4 4" />
  </svg>
)

// Function to get the appropriate icon based on component type
export const getIconForType = (type: string): React.ElementType => {
  switch (type) {
    case "resistor":
      return ResistorIcon
    case "capacitor":
      return CapacitorIcon
    case "inductor":
      return InductorIcon
    case "diode":
      return DiodeIcon
    case "transistor":
      return TransistorIcon
    case "ic":
      return ChipIcon
    case "led":
      return LedIcon
    case "switch":
      return SwitchIcon
    case "voltmeter":
      return VoltmeterIcon
    case "ammeter":
      return AmmeterIcon
    case "oscilloscope":
      return OscilloscopeIcon
    case "power_supply":
      return PowerSupplyIcon
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
    case "transformer":
      return TransformerIcon
    case "buzzer":
      return BuzzerIcon
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
    return "capacitor"
  } else if (lowerName.includes("inductor") || lowerName.includes("l_")) {
    return "inductor"
  } else if (lowerName.includes("diode") || lowerName.includes("d_")) {
    return "diode"
  } else if (lowerName.includes("transistor") || lowerName.includes("q_")) {
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
  } else if (lowerName.includes("power")) {
    return "power_supply"
  } else if (lowerName.includes("gnd")) {
    return "ground"
  } else if (lowerName.includes("connector") || lowerName.includes("conn_")) {
    return "connector"
  } else if (lowerName.includes("potentiometer") || lowerName.includes("pot_")) {
    return "potentiometer"
  } else if (lowerName.includes("fuse")) {
    return "fuse"
  } else if (lowerName.includes("relay")) {
    return "relay"
  } else if (lowerName.includes("transformer")) {
    return "transformer"
  } else if (lowerName.includes("buzzer")) {
    return "buzzer"
  } else {
    return "ic" // Default to IC for unknown components
  }
}

