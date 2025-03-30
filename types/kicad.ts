import { LucideIcon } from "lucide-react";

export interface KicadComponent {
  type: string;
  name: string;
  description: string;
  icon: LucideIcon;
  footprint: {
    width: number;
    height: number;
    pins: {
      x: number;
      y: number;
      type: 'positive' | 'negative' | 'signal' | 'ground' | 'power';
      number: string;
      name?: string;
    }[];
  };
  value?: string;
  library: string;
  symbolPins?: {
    number: string;
    name: string;
    type: string;
  }[];
}

export interface ComponentCategory {
  [key: string]: string[];
}

export interface SymbolPin {
  number: string;
  name: string;
  type: string;
  posX: number;
  posY: number;
}

export interface FootprintPad {
  number: string;
  name: string;
  posX: number;
  posY: number;
  type: string;
  width: number;
  height: number;
}