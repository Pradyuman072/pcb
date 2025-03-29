"use client"

import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import type { ReactNode } from "react"

export function DndProviderWithNoSSR({ children }: { children: ReactNode }) {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>
}

export default DndProviderWithNoSSR

