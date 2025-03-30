import type { ComponentCategory } from "@/types/kicad";

export const COMPONENT_CATEGORIES: ComponentCategory = {
  passive: ["resistor", "capacitor", "inductor", "potentiometer"],
  semiconductors: ["diode", "led", "transistor", "mosfet", "ic"],
  power: ["voltage_regulator", "power_supply", "fuse"],
  connectors: ["connector", "header", "socket"],
  electromechanical: ["relay", "switch", "button"],
  sensors: ["temperature_sensor", "light_sensor", "motion_sensor"],
  communication: ["wifi", "bluetooth", "ethernet"],
  audio: ["speaker", "microphone", "buzzer"]
};