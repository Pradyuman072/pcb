"use client"

import { useEffect, useState } from "react"
import CircuitDesigner from "@/components/circuit-designer"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"

export default function Home() {
  // Prevent hydration errors by rendering only on client side
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="circuit-designer-theme">
     
      <CircuitDesigner />
    </ThemeProvider>
  )
}

