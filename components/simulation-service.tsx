"use client"

import { useCircuitComponents } from "./circuit-component-context"

// This is a simplified simulation service that would normally interface with ngspice
export function useSimulation() {
  const { schematicComponents } = useCircuitComponents()

  const generateNetlist = () => {
    let netlist = "* Circuit netlist generated from schematic\n"

    // Generate component definitions
    schematicComponents.forEach((component, index) => {
      const nodeA = `n${index}_a`
      const nodeB = `n${index}_b`

      switch (component.type) {
        case "resistor":
          netlist += `R${index} ${nodeA} ${nodeB} ${component.value || "1k"}\n`
          break
        case "capacitor":
          netlist += `C${index} ${nodeA} ${nodeB} ${component.value || "10u"}\n`
          break
        case "inductor":
          netlist += `L${index} ${nodeA} ${nodeB} ${component.value || "10m"}\n`
          break
        case "diode":
          netlist += `D${index} ${nodeA} ${nodeB} 1N4148\n`
          break
        case "transistor":
          const nodeC = `n${index}_c`
          netlist += `Q${index} ${nodeA} ${nodeB} ${nodeC} 2N2222\n`
          break
        case "led":
          netlist += `D${index} ${nodeA} ${nodeB} LED\n`
          break
        case "switch":
          netlist += `S${index} ${nodeA} ${nodeB} 0 1 SWITCH\n`
          break
        default:
          break
      }
    })

    // Add voltage source
    netlist += "V1 vcc 0 DC 5V\n"

    // Add analysis commands
    netlist += ".tran 1u 10m\n"
    netlist += ".control\n"
    netlist += "run\n"
    netlist += "plot v(vcc)\n"
    netlist += ".endc\n"
    netlist += ".end\n"

    return netlist
  }

  const runSimulation = async () => {
    const netlist = generateNetlist()

    // In a real implementation, this would send the netlist to a server
    // that runs ngspice and returns the results
    console.log("Running simulation with netlist:", netlist)

    // Simulate a delay for the simulation to run
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return simulated results
    return {
      success: true,
      output: `
* Circuit simulation with ngspice
${netlist}

Running simulation...
Temperature: 27.0 C

Transient analysis... 100%
Simulation completed successfully.

Maximum voltage at node vcc: 5.0V
Minimum voltage at node vcc: 0.0V
Rise time: 2.3ms
      `,
      plots: [
        {
          title: "Voltage vs Time",
          data: [
            { time: 0, voltage: 0 },
            { time: 1, voltage: 3 },
            { time: 2, voltage: 4.5 },
            { time: 3, voltage: 4.9 },
            { time: 4, voltage: 5 },
            { time: 5, voltage: 5 },
            { time: 6, voltage: 5 },
            { time: 7, voltage: 5 },
            { time: 8, voltage: 5 },
            { time: 9, voltage: 5 },
            { time: 10, voltage: 5 },
          ],
        },
      ],
    }
  }

  return {
    generateNetlist,
    runSimulation,
  }
}

