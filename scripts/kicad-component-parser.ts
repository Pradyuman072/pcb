import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

// Types that match your React component's data structure
interface Pin {
  x: number;
  y: number;
  type: "positive" | "negative" | "other";
}

interface Footprint {
  width: number;
  height: number;
  pins: Pin[];
  svgPath?: string;
  schematicSymbol?: string;
}

interface Component {
  name: string;
  type: string;
  value?: string;
  description?: string;
  footprint?: Footprint;
  resistance?: number;
  capacitance?: number;
  inductance?: number;
  voltage?: number;
  current?: number;
  keywords?: string[];
  datasheet?: string;
}

const execPromise = promisify(exec);

// Clone repositories if not exists
// Clone repositories if not exists
async function cloneRepositories() {
  const symbolsPath = path.join(__dirname, 'kicad-symbols');
  const footprintsPath = path.join(__dirname, 'kicad-footprints');
  
  if (!fs.existsSync(symbolsPath)) {
    console.log('Cloning symbols repository...');
    await execPromise(`git clone https://gitlab.com/kicad/libraries/kicad-symbols.git ${symbolsPath}`);
  }
  
  if (!fs.existsSync(footprintsPath)) {
    console.log('Cloning footprints repository...');
    await execPromise(`git clone https://gitlab.com/kicad/libraries/kicad-footprints.git ${footprintsPath}`);
  }
}

// Parse KiCad symbol library files
function parseSymbolFile(filePath: string): Component[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const components: Component[] = [];
  
  // Basic regex pattern to extract component definitions
  const symbolRegex = /\(symbol\s+"([^"]+)"([\s\S]*?)\)/g;
  const propertyRegex = /\(property\s+"([^"]+)"\s+"([^"]+)"/g;
  
  let match;
  while ((match = symbolRegex.exec(content)) !== null) {
    const name = match[1];
    const symbolContent = match[2];
    
    const component: Component = {
      name,
      type: determineComponentType(name),
    };
    
    // Extract properties
    let propMatch;
    while ((propMatch = propertyRegex.exec(symbolContent)) !== null) {
      const propName = propMatch[1];
      const propValue = propMatch[2];
      
      switch (propName) {
        case 'Value':
          component.value = propValue;
          break;
        case 'Description':
          component.description = propValue;
          break;
        case 'Datasheet':
          component.datasheet = propValue;
          break;
        case 'ki_keywords':
          component.keywords = propValue.split(' ');
          break;
      }
    }
    
    // Extract pin information
    component.footprint = extractPinsFromSymbol(symbolContent);
    
    // Add electrical characteristics based on component type
    addElectricalCharacteristics(component);
    
    components.push(component);
  }
  
  return components;
}

// Determine component type from symbol name
function determineComponentType(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('resistor') || lowerName.includes('r_')) {
    return 'resistor';
  } else if (lowerName.includes('capacitor') || lowerName.includes('c_')) {
    return 'capacitor';
  } else if (lowerName.includes('inductor') || lowerName.includes('l_')) {
    return 'inductor';
  } else if (lowerName.includes('diode') || lowerName.includes('d_')) {
    return 'diode';
  } else if (lowerName.includes('transistor') || lowerName.includes('q_')) {
    return 'transistor';
  } else if (lowerName.includes('ic')) {
    return 'ic';
  } else if (lowerName.includes('led')) {
    return 'led';
  } else if (lowerName.includes('switch') || lowerName.includes('sw_')) {
    return 'switch';
  } else if (lowerName.includes('voltmeter')) {
    return 'voltmeter';
  } else if (lowerName.includes('ammeter')) {
    return 'ammeter';
  } else if (lowerName.includes('oscilloscope')) {
    return 'oscilloscope';
  } else if (lowerName.includes('power')) {
    return 'power_supply';
  } else if (lowerName.includes('gnd')) {
    return 'ground';
  } else if (lowerName.includes('connector') || lowerName.includes('conn_')) {
    return 'connector';
  } else if (lowerName.includes('potentiometer') || lowerName.includes('pot_')) {
    return 'potentiometer';
  } else if (lowerName.includes('fuse')) {
    return 'fuse';
  } else if (lowerName.includes('relay')) {
    return 'relay';
  } else if (lowerName.includes('transformer')) {
    return 'transformer';
  } else {
    return 'ic'; // Default to IC for unknown components
  }
}

// Extract pin information from symbol content
function extractPinsFromSymbol(symbolContent: string): Footprint {
  const pinRegex = /\(pin\s+([^\s]+)\s+([^\s]+)\s+\(at\s+([^\s]+)\s+([^\s]+)[^\)]+\)\s+\(length\s+([^\s]+)\)[^\)]*\)/g;
  const pins: Pin[] = [];
  
  let match;
  while ((match = pinRegex.exec(symbolContent)) !== null) {
    const type = match[1] === 'power_in' ? 'positive' : 
                match[1] === 'power_out' ? 'negative' : 'other';
    
    const x = parseFloat(match[3]);
    const y = parseFloat(match[4]);
    
    pins.push({ x, y, type });
  }
  
  // Calculate width and height from pin positions
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  
  if (pins.length > 0) {
    minX = Math.min(...pins.map(p => p.x));
    maxX = Math.max(...pins.map(p => p.x));
    minY = Math.min(...pins.map(p => p.y));
    maxY = Math.max(...pins.map(p => p.y));
  }
  
  // Generate SVG path for schematic representation
  const svgPath = generateSchemticSvgFromSymbol(symbolContent);
  
  return {
    width: Math.max(2, Math.abs(maxX - minX) / 2.54),
    height: Math.max(2, Math.abs(maxY - minY) / 2.54),
    pins,
    svgPath,
    schematicSymbol: svgPath
  };
}

// Generate SVG path from symbol polygons and lines
function generateSchemticSvgFromSymbol(symbolContent: string): string {
  const polylineRegex = /\(polyline\s+\(pts\s+([\s\S]*?)\)\s+\(stroke[^\)]*\)/g;
  const rectRegex = /\(rectangle\s+\(start\s+([^\s]+)\s+([^\s]+)\)\s+\(end\s+([^\s]+)\s+([^\s]+)\)/g;
  
  let svgPath = '';
  
  // Extract polylines
  let match;
  while ((match = polylineRegex.exec(symbolContent)) !== null) {
    const points = match[1].trim().split(' ').filter(p => p.startsWith('('));
    if (points.length > 0) {
      const coords = points.map(p => {
        const nums = p.replace(/[\(\)]/g, '').split(' ');
        return `${nums[0]},${nums[1]}`;
      });
      
      svgPath += `M${coords[0]} `;
      for (let i = 1; i < coords.length; i++) {
        svgPath += `L${coords[i]} `;
      }
    }
  }
  
  // Extract rectangles
  while ((match = rectRegex.exec(symbolContent)) !== null) {
    const startX = match[1];
    const startY = match[2];
    const endX = match[3];
    const endY = match[4];
    
    svgPath += `M${startX},${startY} L${endX},${startY} L${endX},${endY} L${startX},${endY} Z `;
  }
  
  return svgPath.trim();
}

// Add electrical characteristics based on component type
function addElectricalCharacteristics(component: Component): void {
  switch (component.type) {
    case 'resistor':
      component.resistance = 1000; // Default 1kΩ
      break;
    case 'capacitor':
      component.capacitance = 0.000001; // Default 1μF
      break;
    case 'inductor':
      component.inductance = 0.001; // Default 1mH
      break;
    case 'diode':
    case 'led':
      component.voltage = 0.7; // Default forward voltage
      break;
    case 'power_supply':
      component.voltage = 5; // Default 5V
      break;
  }
}

// Process footprint files to match with symbols
function parseFootprintFiles(directory: string): Record<string, Partial<Footprint>> {
  const footprints: Record<string, Partial<Footprint>> = {};
  
  function processDir(dir: string) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDir(fullPath);
      } else if (file.endsWith('.kicad_mod')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const name = file.replace('.kicad_mod', '');
        
        // Extract pad information for pins
        const padRegex = /\(pad\s+"([^"]+)"\s+[^\(]+\(at\s+([^\s]+)\s+([^\s]+)[^\)]+\)/g;
        const pins: Pin[] = [];
        
        let match;
        while ((match = padRegex.exec(content)) !== null) {
          const padNum = match[1];
          const x = parseFloat(match[2]);
          const y = parseFloat(match[3]);
          
          // Determine pin type based on pad number
          let type: "positive" | "negative" | "other" = "other";
          if (padNum === "1" || padNum === "A" || padNum === "+" || padNum === "VCC" || padNum === "VDD") {
            type = "positive";
          } else if (padNum === "2" || padNum === "K" || padNum === "-" || padNum === "GND" || padNum === "VSS") {
            type = "negative";
          }
          
          pins.push({ x, y, type });
        }
        
        // Calculate size from pads
        let minX = 0, maxX = 0, minY = 0, maxY = 0;
        
        if (pins.length > 0) {
          minX = Math.min(...pins.map(p => p.x));
          maxX = Math.max(...pins.map(p => p.x));
          minY = Math.min(...pins.map(p => p.y));
          maxY = Math.max(...pins.map(p => p.y));
        }
        
        footprints[name] = {
          width: Math.max(2, Math.abs(maxX - minX) / 2.54),
          height: Math.max(2, Math.abs(maxY - minY) / 2.54),
          pins
        };
      }
    }
  }
  
  processDir(directory);
  return footprints;
}

// Main function to process libraries and generate JSON
async function processKiCadLibraries() {
  try {
    await cloneRepositories();
    
    const symbolsDir = path.join(__dirname, 'kicad-symbols');
    const footprintsDir = path.join(__dirname, 'kicad-footprints');
    
    // Process all library files
    const components: Component[] = [];
    const symbolFiles = fs.readdirSync(symbolsDir)
      .filter(file => file.endsWith('.kicad_sym') || file.endsWith('.lib'));
    
    for (const file of symbolFiles) {
      const filePath = path.join(symbolsDir, file);
      const fileComponents = parseSymbolFile(filePath);
      components.push(...fileComponents);
    }
    
    // Process footprints
    const footprints = parseFootprintFiles(footprintsDir);
    
    // Match footprints with components where possible
    for (const component of components) {
      // Simple matching logic - could be improved for production
      const possibleFootprints = Object.entries(footprints)
        .filter(([name]) => name.toLowerCase().includes(component.type.toLowerCase()));
      
      if (possibleFootprints.length > 0) {
        // Just take the first matching footprint for simplicity
        const [_, footprint] = possibleFootprints[0];
        
        if (footprint.pins && footprint.pins.length > 0) {
          component.footprint = {
            ...component.footprint,
            width: footprint.width || component.footprint?.width || 2,
            height: footprint.height || component.footprint?.height || 2,
            pins: footprint.pins
          };
        }
      }
    }
    
    // Write to JSON file
    fs.writeFileSync(
      path.join(__dirname, 'component-definitions.json'), 
      JSON.stringify(components, null, 2)
    );
    
    console.log(`Successfully processed ${components.length} components`);
  } catch (error) {
    console.error('Error processing KiCad libraries:', error);
  }
}

// Run the script
processKiCadLibraries();