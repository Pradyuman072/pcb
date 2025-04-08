import type { CircuitComponent } from "@/components/circuit-component-context";

// This is a mock API service that would normally fetch data from a backend
export async function fetchComponentsFromAPI(): Promise<CircuitComponent[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
    return [
      {
        id: "api-resistor",
        type: "resistor",
        name: "Resistor",
        value: "1kΩ",
        x: 0,
        y: 0,
        rotation: 0,
        connections: [],
        footprint: {
          width: 7.62,
          height: 2.5,
          pins: [
            { x: 0, y: 1.25, type: "terminal1" },
            { x: 7.62, y: 1.25, type: "terminal2" },
          ],
        },
      },
      {
        id: "api-capacitor",
        type: "capacitor",
        name: "Capacitor",
        value: "10µF",
        x: 0,
        y: 0,
        rotation: 0,
        connections: [],
        footprint: {
          width: 5,
          height: 3,
          pins: [
            { x: 0, y: 1.5, type: "terminal1" },
            { x: 5, y: 1.5, type: "terminal2" },
          ],
        },
      },
      {
        id: "api-inductor",
        type: "inductor",
        name: "Inductor",
        value: "100mH",
        x: 0,
        y: 0,
        rotation: 0,
        connections: [],
        footprint: {
          width: 7.5,
          height: 3,
          pins: [
            { x: 0, y: 1.5, type: "terminal1" },
            { x: 7.5, y: 1.5, type: "terminal2" },
          ],
        },
      },
      {
        id: "api-diode",
        type: "diode",
        name: "Diode",
        value: "1N4148",
        x: 0,
        y: 0,
        rotation: 0,
        connections: [],
        footprint: {
          width: 5.1,
          height: 2,
          pins: [
            { x: 0, y: 1, type: "anode" },
            { x: 5.1, y: 1, type: "cathode" },
          ],
        },
      },
      {
        id: "api-transistor",
        type: "transistor",
        name: "NPN Transistor",
        value: "2N2222",
        x: 0,
        y: 0,
        rotation: 0,
        connections: [],
        footprint: {
          width: 4.6,
          height: 4.6,
          pins: [
            { x: 1.27, y: 0, type: "emitter" },
            { x: 2.54, y: 0, type: "base" },
            { x: 3.81, y: 0, type: "collector" },
          ],
        },
      },
      {
        id: "api-led",
        type: "led",
        name: "LED",
        value: "Red",
        x: 0,
        y: 0,
        rotation: 0,
        connections: [],
        footprint: {
          width: 5,
          height: 2.5,
          pins: [
            { x: 0, y: 1.25, type: "anode" },
            { x: 5, y: 1.25, type: "cathode" },
          ],
        },
      },
      {
        id: "api-voltmeter",
        type: "voltmeter",
        name: "Voltmeter",
        value: "0-30V",
        x: 0,
        y: 0,
        rotation: 0,
        connections: [],
        footprint: {
          width: 6,
          height: 4,
          pins: [
            { x: 0, y: 2, type: "positive" },
            { x: 6, y: 2, type: "negative" },
          ],
        },
      },
      {
        id: "api-switch",
        type: "switch",
        name: "Switch",
        value: "SPST",
        x: 0,
        y: 0,
        rotation: 0,
        connections: [],
        footprint: {
          width: 6,
          height: 6,
          pins: [
            { x: 0, y: 3, type: "terminal1" },
            { x: 6, y: 3, type: "terminal2" },
          ],
        },
      },
      {
        id: "api-microcontroller-atmega328p",
        type: "microcontroller",
        name: "ATmega328P",
        x: 0,
        y: 0,
        rotation: 0,
        connections: [],
        footprint: {
          width: 18.41,
          height: 7.62,
          pins: Array.from({ length: 28 }, (_, i) => ({
            x: i < 14 ? 0 : 18.41,
            y: i < 14 ? i * 2.54 : (27 - i) * 2.54,
            type: `pin${i + 1}`,
          })),
        },
      },
      {
        id: "api-voltage-source",
        type: "battery",
        name: "Voltage Source",
        value: "5V",
        x: 0,
        y: 0,
        rotation: 0,
        connections: [],
        footprint: {
          width: 6,
          height: 4,
          pins: [
            { x: 0, y: 2, type: "positive" },
            { x: 6, y: 2, type: "negative" },
          ],
        },
      },
      {
        id: "api-ground",
        type: "ground",
        name: "Ground",
        x: 0,
        y: 0,
        rotation: 0,
        connections: [],
        footprint: {
          width: 4,
          height: 2,
          pins: [
            { x: 2, y: 0, type: "ground" },
          ],
        },
      },
    ];
  }
  