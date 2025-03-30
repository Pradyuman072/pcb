
"use client"

import { useState, useEffect, useMemo } from "react";
import { useDrag } from "react-dnd";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle } from "lucide-react";
import { fetchKicadComponents } from "@/lib/kicad-loader";
import { COMPONENT_CATEGORIES } from "@/lib/kicad-categories";
import type { KicadComponent } from "@/types/kicad";
type CategoryKey = keyof typeof COMPONENT_CATEGORIES | "all";

function DraggableComponent({ component }: { component: KicadComponent }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "CIRCUIT_COMPONENT",
    item: component,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const Icon = component.icon;

  return (
    <div ref={dragRef} className={`cursor-grab ${isDragging ? "opacity-50" : ""}`}>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Icon className="h-4 w-4" />
          <span>{component.name}</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {component.library}
          </Badge>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </div>
  );
}

export default function ComponentSidebar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [components, setComponents] = useState<KicadComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponents = async () => {
      try {
        const fetchedComponents = await fetchKicadComponents();
        setComponents(fetchedComponents);
      } catch (err) {
        setError("Failed to load components. Please try again later.");
        console.error("Component loading error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadComponents();
  }, []);

  const filteredComponents = useMemo(() => {
    return components.filter((component) => {
      const matchesSearch = 
        component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeCategory === "all") return matchesSearch;
      
      const categoryTypes = COMPONENT_CATEGORIES[activeCategory];
      return matchesSearch && categoryTypes.includes(component.type);
    });
  }, [components, searchTerm, activeCategory]);

  if (error) {
    return (
      <Sidebar className="border-r mt-16">
        <SidebarContent>
          <div className="p-4 flex items-center gap-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r mt-16">
      <SidebarHeader className="border-b">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Components</h2>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="p-2 flex flex-wrap gap-1">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
            className="flex-1"
          >
            All
          </Button>
          {Object.keys(COMPONENT_CATEGORIES).map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category as CategoryKey)}
              className="flex-1 capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Components</span>
            <Badge variant="outline" className="text-xs">
              {filteredComponents.length}
            </Badge>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <div className="text-sm text-muted-foreground p-4 text-center">
                  Loading components from KiCad libraries...
                </div>
              ) : filteredComponents.length > 0 ? (
                filteredComponents.map((component) => (
                  <DraggableComponent 
                    key={`${component.name}-${component.library}`} 
                    component={component} 
                  />
                ))
              ) : (
                <div className="text-sm text-muted-foreground p-4 text-center">
                  No components match your search.
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}