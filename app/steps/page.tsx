"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CircuitBoardIcon as CircuitIcon, Lightbulb, Zap, Cpu, Wrench, ArrowRight } from "lucide-react"

export default function StepsPage() {
  const steps = [
    {
      title: "Design Your Circuit",
      description:
        "Start by designing your circuit in the schematic editor. Drag and drop components to create your design.",
      icon: <CircuitIcon className="h-8 w-8 text-primary" />,
      tips: ["Use the component library", "Connect pins properly", "Group related components"],
      difficulty: "Beginner",
    },
    {
      title: "Simulate Circuit Behavior",
      description: "Run the simulation to analyze voltage, current, and power distribution in your circuit.",
      icon: <Zap className="h-8 w-8 text-amber-500" />,
      tips: ["Check component values", "Verify power sources", "Look for connection issues"],
      difficulty: "Intermediate",
    },
    {
      title: "Optimize Your Design",
      description: "Refine your circuit based on simulation results to improve performance and efficiency.",
      icon: <Lightbulb className="h-8 w-8 text-green-500" />,
      tips: ["Reduce power consumption", "Simplify complex sections", "Check for redundancies"],
      difficulty: "Intermediate",
    },
    {
      title: "Create PCB Layout",
      description: "Convert your schematic into a physical PCB layout with proper component placement and routing.",
      icon: <Cpu className="h-8 w-8 text-blue-500" />,
      tips: ["Follow design rules", "Optimize trace lengths", "Consider thermal issues"],
      difficulty: "Advanced",
    },
    {
      title: "Export and Manufacture",
      description: "Export your design in industry-standard formats and prepare it for manufacturing.",
      icon: <Wrench className="h-8 w-8 text-purple-500" />,
      tips: ["Check DRC errors", "Verify dimensions", "Include fabrication notes"],
      difficulty: "Advanced",
    },
  ]

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Circuit Design Steps</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Follow these steps to design, simulate, and manufacture your electronic circuits
        </p>
      </div>

      <div className="space-y-6 max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {index < steps.length - 1 && (
              <div className="absolute left-8 top-[5.5rem] bottom-[-1.5rem] w-0.5 bg-border" />
            )}
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  {step.icon}
                </div>
                <div className="grid gap-1">
                  <CardTitle className="flex items-center gap-2">
                    Step {index + 1}: {step.title}
                    <Badge variant={index < 2 ? "default" : index < 4 ? "secondary" : "outline"}>
                      {step.difficulty}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="font-medium">Tips:</div>
                  <ul className="ml-6 list-disc text-sm text-muted-foreground">
                    {step.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
