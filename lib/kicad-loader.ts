import {
  Zap, Battery, Circle, Square, Cpu, ToggleLeft, Lightbulb,
  Gauge, Wifi, Server, Cctv, Plug, Speaker, Mic,
  Thermometer, AlertCircle, HardDrive, CpuIcon, Music
} from "lucide-react";
import type { KicadComponent, SymbolPin, FootprintPad } from "@/types/kicad";

const ICON_MAP = {
  resistor: Zap,
  capacitor: Battery,
  inductor: Circle,
  potentiometer: Gauge,
  varistor: AlertCircle,
  thermistor: Thermometer,
  diode: Zap,
  zener: AlertCircle,
  led: Lightbulb,
  transistor: CpuIcon,
  mosfet: CpuIcon,
  thyristor: CpuIcon,
  triac: CpuIcon,
  ic: Cpu,
  microcontroller: Cpu,
  fpga: Cpu,
  voltage_regulator: Battery,
  power_supply: Battery,
  fuse: AlertCircle,
  connector: Plug,
  header: Plug,
  socket: Plug,
  terminal: Plug,
  relay: ToggleLeft,
  switch: ToggleLeft,
  button: ToggleLeft,
  motor: Circle,
  temperature_sensor: Thermometer,
  light_sensor: Lightbulb,
  motion_sensor: Cctv,
  proximity_sensor: AlertCircle,
  pressure_sensor: Gauge,
  wifi: Wifi,
  bluetooth: Wifi,
  rf: Wifi,
  ethernet: Server,
  speaker: Speaker,
  microphone: Mic,
  buzzer: Speaker,
  audio: Music,
  reverb: Music,
  other: HardDrive
} as const;

const BASE_URL = "https://gitlab.com/kicad/libraries";
const SYMBOLS_URL = `${BASE_URL}/kicad-symbols/-/raw/master`;
const FOOTPRINTS_URL = `${BASE_URL}/kicad-footprints/-/raw/master`;

export async function fetchKicadComponents(): Promise<KicadComponent[]> {
  try {
    console.log("Fetching KiCad components...");
    const [symbols, footprints] = await Promise.all([
      fetchSymbols(),
      fetchFootprints()
    ]);
    return matchComponents(symbols, footprints);
  } catch (error) {
    console.error('Error loading KiCad components:', error);
    throw error;
  }
}

async function fetchSymbols() {
  const libraries = [
    `${SYMBOLS_URL}/Device.kicad_sym`,
    `${SYMBOLS_URL}/Regulator_Linear.kicad_sym`,
    `${SYMBOLS_URL}/Transistor_BJT.kicad_sym`,
    `${SYMBOLS_URL}/Connector.kicad_sym`,
    `${SYMBOLS_URL}/Audio.kicad_sym`
  ];

  const symbols = [];
  
  for (const libUrl of libraries) {
    try {
      const response = await fetch(libUrl);
      if (!response.ok) continue;
      
      const content = await response.text();
      const libName = libUrl.split('/').pop()?.replace('.kicad_sym', '') || 'unknown';
      
      const symbolRegex = /\(symbol "([^"]+)"([\s\S]*?)\)\)/g;
      let match;
      
      while ((match = symbolRegex.exec(content)) !== null) {
        const name = match[1];
        const symbolContent = match[2];
        
        const pins: SymbolPin[] = [];
        const pinRegex = /\(pin (\S+) \(at ([\d.-]+) ([\d.-]+)[\s\S]*?\(name "([^"]*)"\)[\s\S]*?\(number "([^"]*)"\)/g;
        let pinMatch;
        
        while ((pinMatch = pinRegex.exec(symbolContent)) !== null) {
          pins.push({
            number: pinMatch[5],
            name: pinMatch[4],
            type: pinMatch[1],
            posX: parseFloat(pinMatch[2]),
            posY: parseFloat(pinMatch[3])
          });
        }
        
        if (pins.length > 0) {
          symbols.push({
            name,
            library: libName,
            pins,
            type: determineComponentType(name),
            description: getComponentDescription(name)
          });
        }
      }
    } catch (error) {
      console.error(`Error processing library ${libUrl}:`, error);
    }
  }

  return symbols;
}

async function fetchFootprints() {
  // Include Audio_Module.pretty based on the screenshot showing it exists
  const footprintLibs = [
    `${FOOTPRINTS_URL}/Resistor_SMD.pretty`,
    `${FOOTPRINTS_URL}/Capacitor_SMD.pretty`,
    `${FOOTPRINTS_URL}/Diode_SMD.pretty`,
    `${FOOTPRINTS_URL}/Package_DIP.pretty`,
    `${FOOTPRINTS_URL}/Audio_Module.pretty`,
    `${FOOTPRINTS_URL}/Battery.pretty`,
    `${FOOTPRINTS_URL}/Button_Switch_Keyboard.pretty`,
    `${FOOTPRINTS_URL}/Button_Switch_SMD.pretty`,
    `${FOOTPRINTS_URL}/Button_Switch_THT.pretty`,
    `${FOOTPRINTS_URL}/Buzzer_Beeper.pretty`,
    `${FOOTPRINTS_URL}/Connector.pretty`
  ];

  const footprints: Record<string, {
    pads: FootprintPad[];
    description?: string;
    tags?: string[];
  }> = {};

  for (const libUrl of footprintLibs) {
    try {
      // First try to get the index.json
      let footprintFiles: string[] = [];
      
      try {
        const indexResponse = await fetch(`${libUrl}/index.json`);
        if (indexResponse.ok) {
          const index = await indexResponse.json();
          footprintFiles = index.files.filter((f: string) => f.endsWith('.kicad_mod'));
        }
      } catch (e) {
        console.log(`No index.json found for ${libUrl}, falling back to direct access`);
      }
      
      // If no index.json, try to get the directory listing (though this may not work on GitLab)
      if (footprintFiles.length === 0) {
        try {
          const dirResponse = await fetch(libUrl);
          if (dirResponse.ok) {
            // This is a hack - GitLab doesn't provide a simple directory listing API
            // In a real app, you'd need to maintain a list of known footprints
            console.warn(`Couldn't get file list for ${libUrl}, you may need to manually specify footprints`);
            continue;
          }
        } catch (e) {
          console.error(`Error accessing ${libUrl}:`, e);
          continue;
        }
      }
      
      for (const file of footprintFiles) {
        try {
          const fpResponse = await fetch(`${libUrl}/${file}`);
          if (!fpResponse.ok) continue;
          
          const content = await fpResponse.text();
          const fpName = file.replace('.kicad_mod', '');
          
          const pads: FootprintPad[] = [];
          const padRegex = /\(pad "([^"]+)" (?:[\s\S]*?)\(at ([\d.-]+) ([\d.-]+)[\s\S]*?\(size ([\d.-]+) ([\d.-]+)/g;
          let padMatch;
          
          // Extract description if available
          const descrMatch = content.match(/\(descr "([^"]*)"/);
          const tagsMatch = content.match(/\(tags "([^"]*)"/);
          
          while ((padMatch = padRegex.exec(content)) !== null) {
            pads.push({
              number: padMatch[1],
              name: padMatch[1],
              posX: parseFloat(padMatch[2]),
              posY: parseFloat(padMatch[3]),
              width: parseFloat(padMatch[4]),
              height: parseFloat(padMatch[5]),
              type: determinePadType(padMatch[1])
            });
          }
          
          if (pads.length > 0) {
            footprints[fpName] = {
              pads,
              description: descrMatch?.[1],
              tags: tagsMatch?.[1]?.split(' ')
            };
          }
        } catch (error) {
          console.error(`Error processing footprint ${file}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error processing footprint library ${libUrl}:`, error);
    }
  }

  return footprints;
}

function matchComponents(symbols: any[], footprints: Record<string, { pads: FootprintPad[]; description?: string; tags?: string[] }>) {
  return symbols.map(symbol => {
    // Find best matching footprint
    const footprintMatch = findBestFootprintMatch(symbol.name, footprints);
    const [footprintName, footprintData] = footprintMatch || ['', { pads: [] }];
    const pads = footprintData.pads;
    
    const icon = ICON_MAP[symbol.type as keyof typeof ICON_MAP] || ICON_MAP.other;
    const { width, height } = calculateFootprintDimensions(pads);

    return {
      type: symbol.type,
      name: symbol.name,
      description: symbol.description || footprintData.description,
      icon,
      footprint: {
        name: footprintName,
        width,
        height,
        pins: pads.map(pad => ({
          x: pad.posX,
          y: pad.posY,
          type: pad.type,
          number: pad.number,
          name: pad.name
        }))
      },
      library: symbol.library,
      symbolPins: symbol.pins,
      tags: footprintData.tags
    };
  });
}

function findBestFootprintMatch(symbolName: string, footprints: Record<string, { pads: FootprintPad[]; description?: string; tags?: string[] }>) {
  const symbolLower = symbolName.toLowerCase();
  
  // Try exact match first
  if (footprints[symbolName]) {
    return [symbolName, footprints[symbolName]] as const;
  }
  
  // Try matches based on tags if available
  for (const [fpName, fpData] of Object.entries(footprints)) {
    if (fpData.tags && fpData.tags.some(tag => symbolLower.includes(tag.toLowerCase()))) {
      return [fpName, fpData] as const;
    }
  }
  
  // Try partial matches in name
  for (const [fpName, fpData] of Object.entries(footprints)) {
    const fpLower = fpName.toLowerCase();
    if (symbolLower.includes(fpLower) || fpLower.includes(symbolLower)) {
      return [fpName, fpData] as const;
    }
  }
  
  // Fallback to generic type-based match
  const type = determineComponentType(symbolName);
  for (const [fpName, fpData] of Object.entries(footprints)) {
    if (fpName.toLowerCase().includes(type.toLowerCase())) {
      return [fpName, fpData] as const;
    }
    
    // Check if type is mentioned in description or tags
    if (fpData.description?.toLowerCase().includes(type.toLowerCase()) ||
        fpData.tags?.some(tag => tag.toLowerCase().includes(type.toLowerCase()))) {
      return [fpName, fpData] as const;
    }
  }
  
  return null;
}

function calculateFootprintDimensions(pads: FootprintPad[]) {
  if (pads.length === 0) return { width: 2.54, height: 2.54 };
  
  const minX = Math.min(...pads.map(p => p.posX - p.width/2));
  const maxX = Math.max(...pads.map(p => p.posX + p.width/2));
  const minY = Math.min(...pads.map(p => p.posY - p.height/2));
  const maxY = Math.max(...pads.map(p => p.posY + p.height/2));
  
  return {
    width: Math.max(2.54, (maxX - minX) * 1.1), // Add 10% padding
    height: Math.max(2.54, (maxY - minY) * 1.1)
  };
}

function determineComponentType(name: string): string {
  const lowerName = name.toLowerCase();
  const prefix = name.charAt(0).toLowerCase();
  
  const prefixTypes: Record<string, string> = {
    'r': 'resistor',
    'c': 'capacitor',
    'l': 'inductor',
    'd': lowerName.includes('led') ? 'led' : 'diode',
    'q': 'transistor',
    'u': 'ic',
    'j': 'connector',
    's': 'switch',
    't': 'transformer',
    'a': 'audio'
  };

  // Special handling for audio components
  if (lowerName.includes('reverb')) return 'reverb';
  if (lowerName.includes('audio') || lowerName.includes('speaker') || 
     lowerName.includes('mic') || lowerName.includes('buzzer')) {
    return 'audio';
  }

  return prefixTypes[prefix] || 
    (lowerName.includes('regulator') ? 'voltage_regulator' :
    (lowerName.includes('sensor') ? 'sensor' :
    (lowerName.includes('connector') ? 'connector' :
    (lowerName.includes('switch') ? 'switch' : 'other'))));
}

function determinePadType(padNumber: string): 'positive' | 'negative' | 'signal' | 'ground' | 'power' {
  const num = padNumber.toLowerCase();
  if (num === '1' || num === 'a' || num === 'anode') return 'positive';
  if (num === '2' || num === 'k' || num === 'cathode') return 'negative';
  if (num.includes('gnd')) return 'ground';
  if (num.includes('vcc') || num.includes('vdd') || num.includes('vin')) return 'power';
  return 'signal';
}

function getComponentDescription(name: string): string {
  const type = determineComponentType(name);
  const prefix = name.charAt(0).toUpperCase();
  
  const prefixDescriptions: Record<string, string> = {
    'R': 'Resistor',
    'C': 'Capacitor',
    'L': 'Inductor',
    'D': type === 'led' ? 'LED' : 'Diode',
    'Q': 'Transistor',
    'U': 'Integrated Circuit',
    'J': 'Connector',
    'S': 'Switch',
    'T': 'Transformer',
    'A': 'Audio Component'
  };

  // Special descriptions
  if (name.includes('Reverb')) return 'Digital Reverberation Unit';
  if (name.includes('BTDR')) return 'Belton Digital Reverb Module';

  return prefixDescriptions[prefix] || 
    type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
}