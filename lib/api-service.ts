import type { CircuitComponent } from "@/components/circuit-component-context"

// This is a mock API service that would normally fetch data from a backend
export async function fetchComponentsFromAPI(): Promise<CircuitComponent[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock data
  return [
    {
      id: "api-resistor-1",
      type: "resistor",
      name: "Resistor 1kΩ",
      value: "1kΩ",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 2,
        height: 1,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 1, y: 0, type: "negative" },
        ],
      },
      resistance: 1000,
    },
    {
      id: "api-resistor-10k",
      type: "resistor",
      name: "Resistor 10kΩ",
      value: "10kΩ",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 2,
        height: 1,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 1, y: 0, type: "negative" },
        ],
      },
      resistance: 10000,
    },
    {
      id: "api-capacitor-10uf",
      type: "capacitor",
      name: "Capacitor 10μF",
      value: "10μF",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 1,
        height: 2,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 0, y: 1, type: "negative" },
        ],
      },
      capacitance: 0.00001,
    },
    {
      id: "api-capacitor-100nf",
      type: "capacitor",
      name: "Capacitor 100nF",
      value: "100nF",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 1,
        height: 2,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 0, y: 1, type: "negative" },
        ],
      },
      capacitance: 0.0000001,
    },
    {
      id: "api-inductor-10mh",
      type: "inductor",
      name: "Inductor 10mH",
      value: "10mH",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 2,
        height: 1,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 1, y: 0, type: "negative" },
        ],
      },
      inductance: 0.01,
    },
    {
      id: "api-diode-1n4148",
      type: "diode",
      name: "Diode 1N4148",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 1,
        height: 2,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 0, y: 1, type: "negative" },
        ],
      },
    },
    {
      id: "api-transistor-2n2222",
      type: "transistor",
      name: "Transistor 2N2222",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 2,
        height: 2,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 1, y: 0, type: "negative" },
          { x: 0, y: 1, type: "other" },
        ],
      },
    },
    {
      id: "api-led-red",
      type: "led",
      name: "LED Red",
      value: "Red",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 1,
        height: 2,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 0, y: 1, type: "negative" },
        ],
      },
    },
    {
      id: "api-led-green",
      type: "led",
      name: "LED Green",
      value: "Green",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 1,
        height: 2,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 0, y: 1, type: "negative" },
        ],
      },
    },
    {
      id: "api-led-blue",
      type: "led",
      name: "LED Blue",
      value: "Blue",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 1,
        height: 2,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 0, y: 1, type: "negative" },
        ],
      },
    },
    {
      id: "api-switch",
      type: "switch",
      name: "Switch",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 2,
        height: 1,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 1, y: 0, type: "negative" },
        ],
      },
    },
    {
      id: "api-ic-555",
      type: "ic",
      name: "IC 555 Timer",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 4,
        height: 3,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 1, y: 0, type: "negative" },
          { x: 2, y: 0, type: "other" },
          { x: 3, y: 0, type: "other" },
          { x: 0, y: 2, type: "other" },
          { x: 1, y: 2, type: "other" },
          { x: 2, y: 2, type: "other" },
          { x: 3, y: 2, type: "other" },
        ],
      },
    },
    {
      id: "api-voltmeter",
      type: "voltmeter",
      name: "Voltmeter",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 2,
        height: 2,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 1, y: 0, type: "negative" },
        ],
      },
    },
    {
      id: "api-ammeter",
      type: "ammeter",
      name: "Ammeter",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 2,
        height: 2,
        pins: [
          { x: 0, y: 0, type: "positive" },
          { x: 1, y: 0, type: "negative" },
        ],
      },
    },
    {
      id: "api-power-supply",
      type: "power_supply",
      name: "Power Supply 5V",
      value: "5V",
      x: 0,
      y: 0,
      rotation: 0,
      connections: [],
      footprint: {
        width: 2,
        height: 2,
        pins: [
          { x: 0, y: 1, type: "positive" },
          { x: 1, y: 1, type: "negative" },
        ],
      },
      voltage: 5,
    },
  ]
}

// Function to simulate running a circuit simulation
export async function runCircuitSimulation(components: CircuitComponent[], connections: any[]) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return mock simulation results
  return {
    success: true,
    voltages: components.map((c) => ({
      componentId: c.id,
      voltage: Math.random() * 5, // Random voltage between 0-5V
    })),
    currents: components.map((c) => ({
      componentId: c.id,
      current: Math.random() * 0.1, // Random current between 0-100mA
    })),
    waveforms: {
      time: Array.from({ length: 100 }, (_, i) => i * 0.1),
      voltage: Array.from({ length: 100 }, () => 2.5 + Math.random() * 2.5 * Math.sin(Math.random() * 10)),
      current: Array.from({ length: 100 }, () => 0.05 + Math.random() * 0.05 * Math.sin(Math.random() * 10)),
    },
  }
}

