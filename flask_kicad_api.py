import sys
sys.path.append("/Applications/KiCad/KiCad.app/Contents/Frameworks/Python.framework/Versions/3.9/lib/python3.9/site-packages")

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys
import json
import traceback
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Setup KiCad libraries path
def setup_kicad_paths():
    """Setup KiCad library paths based on common installation locations"""
    possible_paths = [
        "/usr/share/kicad",                      # Linux
        "/usr/local/share/kicad",                # Linux alternative
        "/Applications/KiCad/KiCad.app/Contents/SharedSupport",  # macOS
        "C:/Program Files/KiCad/share/kicad",    # Windows
        os.path.expanduser("~/.kicad/share")     # User directory
    ]
    
    for base_path in possible_paths:
        if os.path.exists(base_path):
            # Add paths for scripting, symbols, footprints
            script_path = os.path.join(base_path, "scripting")
            if os.path.exists(script_path):
                sys.path.append(script_path)
                sys.path.append(os.path.join(script_path, "plugins"))
            
            return {
                "base_path": base_path,
                "symbols_path": os.path.join(base_path, "symbols"),
                "footprints_path": os.path.join(base_path, "footprints"),
                "3d_models_path": os.path.join(base_path, "3dmodels")
            }
    
    return None

# Try to import KiCad libraries
try:
    kicad_paths = setup_kicad_paths()
    if kicad_paths:
        # Import KiCad libraries
        import pcbnew
        from pcbnew import FOOTPRINT, IO_MGR, wxPoint
        import kicad_sym
        KICAD_AVAILABLE = True
        print(f"KiCad libraries found at {kicad_paths['base_path']}")
    else:
        print("KiCad paths not found. Please install KiCad or set the correct paths.")
        KICAD_AVAILABLE = False
        exit(1)
except ImportError as e:
    print(f"KiCad libraries not found: {e}")
    KICAD_AVAILABLE = False
    exit(1)

# Function to determine component type based on symbol properties
def determine_component_type(symbol):
    """Determine the type of component based on symbol properties and name"""
    name = symbol.name.lower()
    
    if "resistor" in name or name.startswith("r"):
        return "resistor"
    elif "capacitor" in name or name.startswith("c"):
        return "capacitor"
    elif "inductor" in name or name.startswith("l"):
        return "inductor"
    elif "diode" in name or name.startswith("d") or "led" in name:
        return "diode"
    elif "transistor" in name or any(x in name for x in ["npn", "pnp", "fet", "mosfet"]):
        return "transistor"
    elif "ic" in name or "mcu" in name or "chip" in name or "processor" in name:
        return "ic"
    elif "connector" in name or "header" in name or "socket" in name:
        return "connector"
    else:
        return "other"

# Function to extract symbol pin information
def extract_symbol_pins(symbol):
    """Extract pin information from a KiCad symbol"""
    pins = []
    for pin in symbol.pins:
        pin_info = {
            "number": pin.number,
            "name": pin.name,
            "x": pin.position.x,
            "y": pin.position.y,
            "orientation": pin.orientation,  # 0, 90, 180, or 270 degrees
            "type": pin.electrical_type
        }
        pins.append(pin_info)
    return pins

# Function to extract footprint pad information
def extract_footprint_pads(footprint):
    """Extract pad information from a KiCad footprint"""
    pads = []
    for pad in footprint.Pads():
        pad_info = {
            "number": pad.GetNumber(),
            "name": pad.GetName(),
            "x": pad.GetPosition()[0] / 1000000.0,  # Convert nm to mm
            "y": pad.GetPosition()[1] / 1000000.0,  # Convert nm to mm
            "width": pad.GetSize()[0] / 1000000.0,  # Convert nm to mm
            "height": pad.GetSize()[1] / 1000000.0,  # Convert nm to mm
            "shape": pad.GetShape(),
            "orientation": pad.GetOrientation() / 10.0,  # Convert to degrees
            "layer": pad.GetLayerName()
        }
        pads.append(pad_info)
    return pads

# Function to extract symbol metadata
def extract_symbol_metadata(symbol):
    """Extract metadata from a KiCad symbol"""
    properties = {}
    for prop in symbol.properties:
        properties[prop.key] = prop.value
    
    return {
        "name": symbol.name,
        "description": properties.get("Description", ""),
        "datasheet": properties.get("Datasheet", ""),
        "keywords": properties.get("Keywords", ""),
        "value": properties.get("Value", "")
    }

# Function to extract footprint metadata
def extract_footprint_metadata(footprint):
    """Extract metadata from a KiCad footprint"""
    return {
        "name": footprint.GetFPID().GetLibItemName(),
        "description": footprint.GetDescription(),
        "path": footprint.GetPath(),
        "width": footprint.GetBoundingBox().GetWidth() / 1000000.0,  # Convert nm to mm
        "height": footprint.GetBoundingBox().GetHeight() / 1000000.0,  # Convert nm to mm
        "layer": footprint.GetLayerName(),
        "orientation": footprint.GetOrientation() / 10.0  # Convert to degrees
    }

@app.route('/api/symbols', methods=['GET'])
def get_symbols():
    """
    Get all available symbols from KiCad libraries with orientation information
    """
    try:
        if not KICAD_AVAILABLE:
            return jsonify({
                "success": False,
                "error": "KiCad libraries not available"
            }), 500
        
        symbols = []
        
        # Parse KiCad symbol libraries
        symbols_path = kicad_paths["symbols_path"]
        for lib_file in os.listdir(symbols_path):
            if lib_file.endswith(".kicad_sym"):
                try:
                    lib_name = os.path.splitext(lib_file)[0]
                    lib_path = os.path.join(symbols_path, lib_file)
                    
                    lib = kicad_sym.KicadLibrary.from_file(lib_path)
                    
                    for symbol in lib.symbols:
                        component_type = determine_component_type(symbol)
                        pins = extract_symbol_pins(symbol)
                        metadata = extract_symbol_metadata(symbol)
                        
                        symbol_data = {
                            "name": symbol.name,
                            "library": lib_name,
                            "type": component_type,
                            "pins": pins,
                            "metadata": metadata
                        }
                        
                        symbols.append(symbol_data)
                except Exception as e:
                    print(f"Error processing symbol library {lib_file}: {str(e)}")
                    continue
        
        return jsonify({
            "success": True,
            "symbols": symbols,
            "source": "kicad",
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route('/api/footprints', methods=['GET'])
def get_footprints():
    """
    Get all available footprints from KiCad libraries with orientation information
    """
    try:
        if not KICAD_AVAILABLE:
            return jsonify({
                "success": False,
                "error": "KiCad libraries not available"
            }), 500
        
        footprints = []
        
        # Parse KiCad footprint libraries
        fp_path = kicad_paths["footprints_path"]
        io = IO_MGR.PluginFind(IO_MGR.KICAD_SEXP)
        
        for lib_dir in os.listdir(fp_path):
            lib_path = os.path.join(fp_path, lib_dir)
            if os.path.isdir(lib_path):
                try:
                    # List all footprints in the library
                    fp_list = io.FootprintEnumerate(lib_path)
                    
                    for fp_name in fp_list:
                        try:
                            # Load the footprint
                            footprint = io.FootprintLoad(lib_path, fp_name)
                            
                            # Extract pad information
                            pads = extract_footprint_pads(footprint)
                            
                            # Extract metadata
                            metadata = extract_footprint_metadata(footprint)
                            
                            footprint_data = {
                                "name": fp_name,
                                "library": lib_dir,
                                "pads": pads,
                                "metadata": metadata
                            }
                            
                            footprints.append(footprint_data)
                        except Exception as e:
                            print(f"Error processing footprint {fp_name}: {str(e)}")
                            continue
                except Exception as e:
                    print(f"Error enumerating footprints in {lib_dir}: {str(e)}")
                    continue
        
        return jsonify({
            "success": True,
            "footprints": footprints,
            "source": "kicad",
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route('/api/symbol/<symbol_name>', methods=['GET'])
def get_symbol_details(symbol_name):
    """
    Get detailed information about a specific symbol
    """
    try:
        library = request.args.get('library', None)
        
        if not KICAD_AVAILABLE:
            return jsonify({
                "success": False,
                "error": "KiCad libraries not available"
            }), 500
        
        # If KiCad is available, fetch the symbol data
        symbols_path = kicad_paths["symbols_path"]
        
        if library:
            # Search in specific library
            lib_file = f"{library}.kicad_sym"
            lib_path = os.path.join(symbols_path, lib_file)
            
            if not os.path.exists(lib_path):
                return jsonify({
                    "success": False,
                    "error": f"Library {library} not found"
                }), 404
            
            lib = kicad_sym.KicadLibrary.from_file(lib_path)
            
            for symbol in lib.symbols:
                if symbol.name == symbol_name:
                    component_type = determine_component_type(symbol)
                    pins = extract_symbol_pins(symbol)
                    metadata = extract_symbol_metadata(symbol)
                    
                    symbol_data = {
                        "name": symbol.name,
                        "library": library,
                        "type": component_type,
                        "pins": pins,
                        "metadata": metadata
                    }
                    
                    return jsonify({
                        "success": True,
                        "symbol": symbol_data,
                        "source": "kicad",
                        "timestamp": datetime.now().isoformat()
                    })
        else:
            # Search in all libraries
            for lib_file in os.listdir(symbols_path):
                if lib_file.endswith(".kicad_sym"):
                    try:
                        lib_name = os.path.splitext(lib_file)[0]
                        lib_path = os.path.join(symbols_path, lib_file)
                        
                        lib = kicad_sym.KicadLibrary.from_file(lib_path)
                        
                        for symbol in lib.symbols:
                            if symbol.name == symbol_name:
                                component_type = determine_component_type(symbol)
                                pins = extract_symbol_pins(symbol)
                                metadata = extract_symbol_metadata(symbol)
                                
                                symbol_data = {
                                    "name": symbol.name,
                                    "library": lib_name,
                                    "type": component_type,
                                    "pins": pins,
                                    "metadata": metadata
                                }
                                
                                return jsonify({
                                    "success": True,
                                    "symbol": symbol_data,
                                    "source": "kicad",
                                    "timestamp": datetime.now().isoformat()
                                })
                    except Exception as e:
                        print(f"Error processing symbol library {lib_file}: {str(e)}")
                        continue
        
        return jsonify({
            "success": False,
            "error": f"Symbol {symbol_name} not found",
            "source": "kicad"
        }), 404
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route('/api/footprint/<footprint_name>', methods=['GET'])
def get_footprint_details(footprint_name):
    """
    Get detailed information about a specific footprint
    """
    try:
        library = request.args.get('library', None)
        
        if not KICAD_AVAILABLE:
            return jsonify({
                "success": False,
                "error": "KiCad libraries not available"
            }), 500
        
        # If KiCad is available, fetch the footprint data
        fp_path = kicad_paths["footprints_path"]
        io = IO_MGR.PluginFind(IO_MGR.KICAD_SEXP)
        
        if library:
            # Search in specific library
            lib_path = os.path.join(fp_path, library)
            
            if not os.path.exists(lib_path) or not os.path.isdir(lib_path):
                return jsonify({
                    "success": False,
                    "error": f"Library {library} not found"
                }), 404
            
            try:
                # Try to load the footprint
                footprint = io.FootprintLoad(lib_path, footprint_name)
                
                # Extract pad information
                pads = extract_footprint_pads(footprint)
                
                # Extract metadata
                metadata = extract_footprint_metadata(footprint)
                
                footprint_data = {
                    "name": footprint_name,
                    "library": library,
                    "pads": pads,
                    "metadata": metadata
                }
                
                return jsonify({
                    "success": True,
                    "footprint": footprint_data,
                    "source": "kicad",
                    "timestamp": datetime.now().isoformat()
                })
            except Exception as e:
                return jsonify({
                    "success": False,
                    "error": f"Error loading footprint {footprint_name}: {str(e)}"
                }), 404
        else:
            # Search in all libraries
            for lib_dir in os.listdir(fp_path):
                lib_path = os.path.join(fp_path, lib_dir)
                if os.path.isdir(lib_path):
                    try:
                        # Try to load the footprint
                        footprint = io.FootprintLoad(lib_path, footprint_name)
                        
                        # Extract pad information
                        pads = extract_footprint_pads(footprint)
                        
                        # Extract metadata
                        metadata = extract_footprint_metadata(footprint)
                        
                        footprint_data = {
                            "name": footprint_name,
                            "library": lib_dir,
                            "pads": pads,
                            "metadata": metadata
                        }
                        
                        return jsonify({
                            "success": True,
                            "footprint": footprint_data,
                            "source": "kicad",
                            "timestamp": datetime.now().isoformat()
                        })
                    except Exception:
                        # Footprint not found in this library, continue to next
                        continue
        
        return jsonify({
            "success": False,
            "error": f"Footprint {footprint_name} not found",
            "source": "kicad"
        }), 404
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route('/api/component-orientation', methods=['GET'])
def get_component_orientation():
    """
    Get orientation information for a component by matching symbol and footprint
    """
    try:
        symbol_name = request.args.get('symbol', None)
        footprint_name = request.args.get('footprint', None)
        
        if not symbol_name or not footprint_name:
            return jsonify({
                "success": False,
                "error": "Both 'symbol' and 'footprint' parameters are required"
            }), 400
        
        # First, get the symbol data
        symbol_response = get_symbol_details(symbol_name).get_json()
        if not symbol_response.get('success', False):
            return jsonify({
                "success": False,
                "error": f"Symbol {symbol_name} not found"
            }), 404
        
        # Then, get the footprint data
        footprint_response = get_footprint_details(footprint_name).get_json()
        if not footprint_response.get('success', False):
            return jsonify({
                "success": False,
                "error": f"Footprint {footprint_name} not found"
            }), 404
        
        symbol = symbol_response['symbol']
        footprint = footprint_response['footprint']
        
        # Compute pin-to-pad mappings and orientation information
        symbol_pins = symbol['pins']
        footprint_pads = footprint['pads']
        
        # Simple mapping by pin/pad number
        mapping = []
        for pin in symbol_pins:
            for pad in footprint_pads:
                if pin['number'] == pad['number']:
                    mapping.append({
                        "pin": pin,
                        "pad": pad,
                        "symbol_orientation": pin['orientation'],
                        "footprint_orientation": pad['orientation']
                    })
        
        return jsonify({
            "success": True,
            "symbol": symbol,
            "footprint": footprint,
            "pin_pad_mapping": mapping,
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route('/api/library-info', methods=['GET'])
def get_library_info():
    """
    Get information about all available libraries
    """
    try:
        if not KICAD_AVAILABLE:
            return jsonify({
                "success": False,
                "error": "KiCad libraries not available"
            }), 500
        
        # If KiCad is available, fetch library information
        symbol_libraries = []
        footprint_libraries = []
        
        # Get symbol libraries
        symbols_path = kicad_paths["symbols_path"]
        for lib_file in os.listdir(symbols_path):
            if lib_file.endswith(".kicad_sym"):
                try:
                    lib_name = os.path.splitext(lib_file)[0]
                    lib_path = os.path.join(symbols_path, lib_file)
                    
                    lib = kicad_sym.KicadLibrary.from_file(lib_path)
                    
                    symbol_libraries.append({
                        "name": lib_name,
                        "path": lib_path,
                        "count": len(lib.symbols)
                    })
                except Exception as e:
                    print(f"Error processing symbol library {lib_file}: {str(e)}")
                    continue
        
        # Get footprint libraries
        fp_path = kicad_paths["footprints_path"]
        io = IO_MGR.PluginFind(IO_MGR.KICAD_SEXP)
        
        for lib_dir in os.listdir(fp_path):
            lib_path = os.path.join(fp_path, lib_dir)
            if os.path.isdir(lib_path):
                try:
                    # Count footprints in the library
                    fp_list = io.FootprintEnumerate(lib_path)
                    
                    footprint_libraries.append({
                        "name": lib_dir,
                        "path": lib_path,
                        "count": len(fp_list)
                    })
                except Exception as e:
                    print(f"Error enumerating footprints in {lib_dir}: {str(e)}")
                    continue
        
        return jsonify({
            "success": True,
            "libraries": {
                "symbols": symbol_libraries,
                "footprints": footprint_libraries
            },
            "source": "kicad",
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route('/api/symbol-search', methods=['GET'])
def search_symbols():
    """
    Search for symbols based on name, type, or pins
    """
    try:
        query = request.args.get('query', '')
        component_type = request.args.get('type', '')
        min_pins = request.args.get('min_pins', 0, type=int)
        max_pins = request.args.get('max_pins', 1000, type=int)
        
        if not KICAD_AVAILABLE:
            return jsonify({
                "success": False,
                "error": "KiCad libraries not available"
            }), 500
        
        # If KiCad is available, search in all symbol libraries
        results = []
        symbols_path = kicad_paths["symbols_path"]
        
        for lib_file in os.listdir(symbols_path):
            if lib_file.endswith(".kicad_sym"):
                try:
                    lib_name = os.path.splitext(lib_file)[0]
                    lib_path = os.path.join(symbols_path, lib_file)
                    
                    lib = kicad_sym.KicadLibrary.from_file(lib_path)
                    
                    for symbol in lib.symbols:
                        # Check if symbol matches search criteria
                        component_type_match = determine_component_type(symbol)
                        if query.lower() in symbol.name.lower() or query.lower() in lib_name.lower():
                            if not component_type or component_type_match == component_type:
                                pin_count = len(symbol.pins)
                                if min_pins <= pin_count <= max_pins:
                                    pins = extract_symbol_pins(symbol)
                                    metadata = extract_symbol_metadata(symbol)
                                    
                                    symbol_data = {
                                        "name": symbol.name,
                                        "library": lib_name,
                                        "type": component_type_match,
                                        "pin_count": pin_count,
                                        "pins": pins,
                                        "metadata": metadata
                                    }
                                    
                                    results.append(symbol_data)
                except Exception as e:
                    print(f"Error processing symbol library {lib_file}: {str(e)}")
                    continue
        
        return jsonify({
            "success": True,
            "symbols": results,
            "count": len(results),
            "source": "kicad",
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route('/api/footprint-search', methods=['GET'])
def search_footprints():
    """
    Search for footprints based on name, library, or pad count
    """
    try:
        query = request.args.get('query', '')
        library = request.args.get('library', '')
        min_pads = request.args.get('min_pads', 0, type=int)
        max_pads = request.args.get('max_pads', 1000, type=int)
        
        if not KICAD_AVAILABLE:
            return jsonify({
                "success": False,
                "error": "KiCad libraries not available"
            }), 500
        
        # If KiCad is available, search in all footprint libraries
        results = []
        fp_path = kicad_paths["footprints_path"]
        io = IO_MGR.PluginFind(IO_MGR.KICAD_SEXP)
        
        for lib_dir in os.listdir(fp_path):
            if library and lib_dir != library:
                continue
                
            lib_path = os.path.join(fp_path, lib_dir)
            if os.path.isdir(lib_path):
                try:
                    # List all footprints in the library
                    fp_list = io.FootprintEnumerate(lib_path)
                    
                    for fp_name in fp_list:
                        if query.lower() in fp_name.lower():
                            try:
                                # Load the footprint
                                footprint = io.FootprintLoad(lib_path, fp_name)
                                
                                # Count pads
                                pad_count = footprint.GetPadCount()
                                
                                if min_pads <= pad_count <= max_pads:
                                    # Extract pad information
                                    pads = extract_footprint_pads(footprint)
                                    
                                    # Extract metadata
                                    metadata = extract_footprint_metadata(footprint)
                                    
                                    footprint_data = {
                                        "name": fp_name,
                                        "library": lib_dir,
                                        "pad_count": pad_count,
                                        "pads": pads,
                                        "metadata": metadata
                                    }
                                    
                                    results.append(footprint_data)
                            except Exception as e:
                                print(f"Error processing footprint {fp_name}: {str(e)}")
                                continue
                except Exception as e:
                    print(f"Error enumerating footprints in {lib_dir}: {str(e)}")
                    continue
        
        return jsonify({
            "success": True,
            "footprints": results,
            "count": len(results),
            "source": "kicad",
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)