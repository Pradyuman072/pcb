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

// Modified to only clone footprints repository
async function cloneFootprintsRepository() {
  const footprintsPath = path.join(__dirname, 'kicad-footprints');
  
  if (!fs.existsSync(footprintsPath)) {
    console.log('Cloning footprints repository...');
    await execPromise(`git clone https://gitlab.com/kicad/libraries/kicad-footprints.git ${footprintsPath}`);
  }
}

// Parse KiCad symbol library files - this would be used if you have local files
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
  } else if (lowerName.includes('buzzer')) {
    return 'buzzer';
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
  
  return {
    width: Math.max(2, Math.abs(maxX - minX) / 2.54),
    height: Math.max(2, Math.abs(maxY - minY) / 2.54),
    pins,
  };
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

// Process footprint files - modified to use tags for component name when available
function parseFootprintFiles(directory: string): Component[] {
  const components: Component[] = [];
  
  function processDir(dir: string) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDir(fullPath);
      } else if (file.endsWith('.kicad_mod')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Extract footprint name
        const nameMatch = content.match(/\(footprint\s+"([^"]+)"/);
        if (!nameMatch) continue;
        
        const defaultName = nameMatch[1];
        
        // Extract description and tags
        const descrMatch = content.match(/\(descr\s+"([^"]+)"/);
        const descr = descrMatch ? descrMatch[1] : '';
        
        const tagsMatch = content.match(/\(tags\s+"([^"]+)"/);
        const tags = tagsMatch ? tagsMatch[1] : '';
        
        // Extract properties
        const properties: Record<string, string> = {};
        const propertyRegex = /\(property\s+"([^"]+)"\s+"([^"]+)"/g;
        let propMatch;
        while ((propMatch = propertyRegex.exec(content)) !== null) {
          properties[propMatch[1]] = propMatch[2];
        }
        
        // Extract pad information for pins
        const padRegex = /\(pad\s+"([^"]+)"\s+([^\s]+)[^\(]+\(at\s+([^\s]+)\s+([^\s]+)[^\)]+\)/g;
        const pins: Pin[] = [];
        
        let match;
        while ((match = padRegex.exec(content)) !== null) {
          const padNum = match[1];
          const padType = match[2]; // rect, circle, etc.
          const x = parseFloat(match[3]);
          const y = parseFloat(match[4]);
          
          // Determine pin type based on pad number and any "+" symbol in the footprint
          let type: "positive" | "negative" | "other" = "other";
          
          if (padNum === "1" || padNum === "A" || padNum === "+" || padNum === "VCC" || padNum === "VDD") {
            type = "positive";
          } else if (padNum === "2" || padNum === "K" || padNum === "-" || padNum === "GND" || padNum === "VSS") {
            type = "negative";
          }
          
          // Check for plus signs in text elements that might indicate polarity
          const plusMatch = content.match(/\(fp_text\s+user\s+"\+"\s*\(at\s+([^\s]+)\s+([^\s]+)/);
          if (plusMatch && padNum === "1") {
            type = "positive";
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
        
        // Look for circles in the footprint for better size estimation
        const circleRegex = /\(fp_circle\s+\(center\s+([^\s]+)\s+([^\s]+)\)\s+\(end\s+([^\s]+)\s+([^\s]+)\)/g;
        while ((match = circleRegex.exec(content)) !== null) {
          const centerX = parseFloat(match[1]);
          const centerY = parseFloat(match[2]);
          const endX = parseFloat(match[3]);
          const endY = parseFloat(match[4]);
          
          // Calculate radius
          const radius = Math.sqrt(Math.pow(endX - centerX, 2) + Math.pow(endY - centerY, 2));
          
          // Update bounds if this circle is larger
          minX = Math.min(minX, centerX - radius);
          maxX = Math.max(maxX, centerX + radius);
          minY = Math.min(minY, centerY - radius);
          maxY = Math.max(maxY, centerY + radius);
        }
        
        // Create component type based on tags
        let componentType = 'ic'; // Default
        const tagsLower = tags.toLowerCase();
        if (tagsLower.includes('resistor')) componentType = 'resistor';
        else if (tagsLower.includes('capacitor')) componentType = 'capacitor';
        else if (tagsLower.includes('inductor')) componentType = 'inductor';
        else if (tagsLower.includes('diode')) componentType = 'diode';
        else if (tagsLower.includes('transistor')) componentType = 'transistor';
        else if (tagsLower.includes('led')) componentType = 'led';
        else if (tagsLower.includes('switch')) componentType = 'switch';
        else if (tagsLower.includes('connector')) componentType = 'connector';
        else if (tagsLower.includes('potentiometer')) componentType = 'potentiometer';
        else if (tagsLower.includes('fuse')) componentType = 'fuse';
        else if (tagsLower.includes('relay')) componentType = 'relay';
        else if (tagsLower.includes('transformer')) componentType = 'transformer';
        else if (tagsLower.includes('buzzer')) componentType = 'buzzer';
        
        // Use tags for the name if available, otherwise use default name
        const tagBasedName = tags ? tags.split(' ')[0] : null;
        const componentName = tagBasedName || defaultName;
        
        // Create the component
        const component: Component = {
          name: componentName,
          type: componentType,
          description: descr || undefined,
          value: properties.Value || undefined,
          datasheet: properties.Datasheet || undefined,
          keywords: tags ? tags.split(' ') : undefined,
          footprint: {
            width: Math.max(2, Math.abs(maxX - minX) / 2.54),
            height: Math.max(2, Math.abs(maxY - minY) / 2.54),
            pins
          }
        };
        
        // Add electrical characteristics
        addElectricalCharacteristics(component);
        
        components.push(component);
      }
    }
  }
  
  processDir(directory);
  return components;
}

// Main function to process libraries and generate JSON
async function processKiCadLibraries() {
  try {
    // Only clone footprints repository
    await cloneFootprintsRepository();
    
    const footprintsDir = path.join(__dirname, 'kicad-footprints');
    
    // Process footprints and generate components directly
    const components = parseFootprintFiles(footprintsDir);
    
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