"use client"

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Search, Star, Clock, ArrowRight } from "lucide-react"

export default function DocsPage() {
  const categories = [
    {
      title: "Getting Started",
      docs: [
        { title: "Introduction to Circuit Design", path: "/docs/introduction" },
        { title: "User Interface Guide", path: "/docs/ui-guide" },
        { title: "Component Library Overview", path: "/docs/components" },
        { title: "Creating Your First Circuit", path: "/docs/first-circuit" },
      ],
    },
    {
      title: "Tutorials",
      docs: [
        { title: "LED Flasher Circuit", path: "/docs/led-flasher" },
        { title: "Audio Amplifier Design", path: "/docs/audio-amplifier" },
        { title: "Power Supply Unit", path: "/docs/power-supply" },
        { title: "Arduino Weather Station", path: "/docs/weather-station" },
        { title: "Digital Clock Circuit", path: "/docs/digital-clock" },
      ],
    },
    {
      title: "Advanced Topics",
      docs: [
        { title: "PCB Design Guidelines", path: "/docs/pcb-guidelines" },
        { title: "Simulation Parameters", path: "/docs/simulation" },
        { title: "Exporting for Manufacturing", path: "/docs/manufacturing" },
        { title: "Custom Component Creation", path: "/docs/custom-components" },
      ],
    },
  ]

  const popularDocs = [
    { title: "LED Flasher Circuit", path: "/docs/led-flasher", views: 1245 },
    { title: "Power Supply Unit", path: "/docs/power-supply", views: 987 },
    { title: "PCB Design Guidelines", path: "/docs/pcb-guidelines", views: 876 },
    { title: "Creating Your First Circuit", path: "/docs/first-circuit", views: 754 },
  ]

  const recentDocs = [
    { title: "Arduino Weather Station", path: "/docs/weather-station", date: "2 days ago" },
    { title: "Digital Clock Circuit", path: "/docs/digital-clock", date: "1 week ago" },
    { title: "Custom Component Creation", path: "/docs/custom-components", date: "2 weeks ago" },
    { title: "Simulation Parameters", path: "/docs/simulation", date: "3 weeks ago" },
  ]

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Documentation</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive guides and tutorials for circuit design and simulation
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search documentation..." className="pl-10 bg-background" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Docs</TabsTrigger>
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {categories.map((category, i) => (
                <div key={i} className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    {category.title}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {category.docs.map((doc, j) => (
                      <Card key={j}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{doc.title}</CardTitle>
                        </CardHeader>
                        <CardFooter>
                          <Button variant="ghost" size="sm" className="ml-auto" asChild>
                            <a href={doc.path}>
                              Read <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="getting-started">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Getting Started
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories[0].docs.map((doc, j) => (
                    <Card key={j}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{doc.title}</CardTitle>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="ml-auto" asChild>
                          <a href={doc.path}>
                            Read <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tutorials">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Tutorials
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories[1].docs.map((doc, j) => (
                    <Card key={j}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{doc.title}</CardTitle>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="ml-auto" asChild>
                          <a href={doc.path}>
                            Read <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Advanced Topics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories[2].docs.map((doc, j) => (
                    <Card key={j}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{doc.title}</CardTitle>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="ml-auto" asChild>
                          <a href={doc.path}>
                            Read <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Popular Docs
            </h2>
            <div className="space-y-4">
              {popularDocs.map((doc, i) => (
                <Card key={i}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">{doc.title}</CardTitle>
                    <CardDescription>{doc.views} views</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Recently Updated
            </h2>
            <div className="space-y-4">
              {recentDocs.map((doc, i) => (
                <Card key={i}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">{doc.title}</CardTitle>
                    <CardDescription>Updated {doc.date}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
