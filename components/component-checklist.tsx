"use client"

import { useCircuitComponents } from "./circuit-component-context"
import { Check, X } from "lucide-react"

export default function ComponentChecklist() {
  const { components, pcbComponents } = useCircuitComponents()

  if (components.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No components added yet. Drag components from the sidebar to the schematic.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {components.map((component) => {
        const isInPcb = pcbComponents.some((c) => c.id === component.id)

        return (
          <div key={component.id} className="flex items-center justify-between p-2 rounded-md border">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{component.name}</div>
              {component.value && <div className="text-xs text-muted-foreground">{component.value}</div>}
            </div>
            <div className="ml-2">
              {isInPcb ? (
                <div className="flex items-center text-xs text-green-500">
                  <Check className="h-4 w-4 mr-1" />
                  <span>PCB</span>
                </div>
              ) : (
                <div className="flex items-center text-xs text-amber-500">
                  <X className="h-4 w-4 mr-1" />
                  <span>Schematic only</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

