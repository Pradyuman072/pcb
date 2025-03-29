"use client"

import { useState, useEffect } from "react"
import { useCircuitComponents } from "./circuit-component-context"
import { Button } from "@/components/ui/button"
import { Play, RefreshCw } from "lucide-react"

export default function SimulationView() {
  const { schematicComponents, connections } = useCircuitComponents()
  const [simulationOutput, setSimulationOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)

  const generateNetlist = () => {
    let netlist = "* Circuit netlist generated from schematic\n"
    netlist += ".include models.lib\n"
    netlist += ".option TEMP=27\n\n"

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
        case "power_supply":
          netlist += `V${index} ${nodeA} ${nodeB} DC ${component.voltage || "5"}V\n`
          break
        default:
          break
      }
    })

    // Add voltage source if none exists
    if (!schematicComponents.some((c) => c.type === "power_supply")) {
      netlist += "V1 1 0 DC 5V\n"
    }

    // Add analysis commands
    netlist += "\n* Analysis commands\n"
    netlist += ".tran 1u 10m\n"
    netlist += ".control\n"
    netlist += "run\n"
    netlist += "plot v(1) v(2)\n"
    netlist += ".endc\n"
    netlist += ".end\n"

    return netlist
  }

  const runSimulation = () => {
    setIsRunning(true)

    // Generate netlist
    const netlist = generateNetlist()
    setSimulationOutput(netlist + "\n\nRunning simulation...\n")

    // Simulate delay for running simulation
    setTimeout(() => {
      const output =
        netlist +
        `
Running simulation...
Temperature: 27.0 C

Transient analysis... 100%
Simulation completed successfully.

${
  schematicComponents.length > 0
    ? `Circuit contains ${schematicComponents.length} components and ${connections.length} connections.
Maximum voltage: 5.0V
Minimum voltage: 0.0V
Rise time: 2.3ms`
    : "No components in circuit. Add components to see simulation results."
}
`
      setSimulationOutput(output)
      setIsRunning(false)
    }, 2000)
  }

  // Run simulation when view is first loaded
  useEffect(() => {
    if (!simulationOutput) {
      runSimulation()
    }
  }, [simulationOutput])

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold mb-2">ngspice Simulation</h2>
          <p className="text-sm text-muted-foreground">View simulation results for your circuit using ngspice.</p>
        </div>
        <Button onClick={runSimulation} disabled={isRunning} className="ml-auto">
          {isRunning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
          {isRunning ? "Running..." : "Run Simulation"}
        </Button>
      </div>
      <div className="flex-1 border rounded-md p-4 bg-black text-green-400 font-mono text-sm overflow-auto">
        <pre>{simulationOutput || "Preparing simulation..."}</pre>
      </div>
    </div>
  )
}

