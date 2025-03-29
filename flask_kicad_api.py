"""
Flask API for KiCad Integration

This script creates a Flask API that interfaces with KiCad's Python library
to provide component data, footprints, and symbols for the circuit design application.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys
import json
import base64
from datetime import datetime
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Try to import KiCad libraries
try:
    # Add KiCad Python modules to path
    # This path may need to be adjusted based on your KiCad installation
    kicad_path = "/usr/share/kicad/scripting/plugins"
    if os.path.exists(kicad_path):
        sys.path.append(kicad_path)
    
    # Import KiCad libraries
    import pcbnew
    import kicad_sym
    KICAD_AVAILABLE = True
except ImportError:
    print("KiCad libraries not found. Running in simulation mode.")
    KICAD_AVAILABLE = False

# Mock data for when KiCad is not available
MOCK_COMPONENTS = [
    {
        "id": "kicad-resistor-1k",
        "type": "resistor",
        "name": "Resistor 1kΩ (KiCad)",
        "value": "1kΩ",
        "footprint": {
            "width": 2,
            "height": 1,
            "pins": [
                {"x": 0, "y": 0, "type": "positive"},
                {"x": 1, "y": 0, "type": "negative"}
            ]
        },
        "symbol": "R",
        "library": "Device",
        "package": "R_0805_2012Metric"
    },
    {
        "id": "kicad-capacitor-100n",
        "type": "capacitor",
        "name": "Capacitor 100nF (KiCad)",
        "value": "100nF",
        "footprint": {
            "width": 1,
            "height": 2,
            "pins": [
                {"x": 0, "y": 0, "type": "positive"},
                {"x": 0, "y": 1, "type": "negative"}
            ]
        },
        "symbol": "C",
        "library": "Device",
        "package": "C_0805_2012Metric"
    },
    {
        "id": "kicad-led-red",
        "type": "led",
        "name": "LED Red (KiCad)",
        "value": "Red",
        "footprint": {
            "width": 1,
            "height": 2,
            "pins": [
                {"x": 0, "y": 0, "type": "positive"},
                {"x": 0, "y": 1, "type": "negative"}
            ]
        },
        "symbol": "LED",
        "library": "Device",
        "package": "LED_0805_2012Metric"
    },
    {
        "id": "kicad-ic-atmega328p",
        "type": "ic",
        "name": "ATmega328P (KiCad)",
        "footprint": {
            "width": 4,
            "height": 4,
            "pins": [
                {"x": 0, "y": 0, "type": "positive"},
                {"x": 1, "y": 0, "type": "negative"},
                {"x": 2, "y": 0, "type": "other"},
                {"x": 3, "y": 0, "type": "other"},
                {"x": 0, "y": 3, "type": "other"},
                {"x": 1, "y": 3, "type": "other"},
                {"x": 2, "y": 3, "type": "other"},
                {"x": 3, "y": 3, "type": "other"}
            ]
        },
        "symbol": "ATmega328P-AU",
        "library": "MCU_Microchip_ATmega",
        "package": "TQFP-32_7x7mm_P0.8mm"
    },
    {
        "id": "kicad-transistor-2n2222",
        "type": "transistor",
        "name": "2N2222 (KiCad)",
        "footprint": {
            "width": 2,
            "height": 2,
            "pins": [
                {"x": 0, "y": 0, "type": "positive"},
                {"x": 1, "y": 0, "type": "negative"},
                {"x": 0, "y": 1, "type": "other"}
            ]
        },
        "symbol": "2N2222",
        "library": "Transistor_BJT",
        "package": "TO-92_Inline"
    }
]

@app.route('/api/components', methods=['GET'])
def get_components():
    """
    Get all available components from KiCad libraries
    """
    try:
        if not KICAD_AVAILABLE:
            # Return mock data if KiCad is not available
            return jsonify({
                "success": True,
                "components": MOCK_COMPONENTS,
                "source": "mock",
                "timestamp": datetime.now().isoformat()
            })
        
        # If KiCad is available, we would fetch real component data here
        # This is a placeholder for actual KiCad library parsing
        components = []
        
        # Example of how we might parse KiCad libraries
        # lib_path = "/usr/share/kicad/symbols"
        # for lib_file in os.listdir(lib_path):
        #     if lib_file.endswith(".kicad_sym"):
        #         lib_name = os.path.splitext(lib_file)[0]
        #         lib = kicad_sym.KicadSymbolLib.from_file(os.path.join(lib_path, lib_file))
        #         for symbol in lib.symbols:
        #             # Process each symbol and convert to our format
        #             components.append({
        #                 "id": f"kicad-{lib_name}-{symbol.name}",
        #                 "type": determine_component_type(symbol),
        #                 "name": symbol.name,
        #                 "value": symbol.properties.get("Value", ""),
        #                 "footprint": convert_footprint(symbol),
        #                 "symbol": symbol.name,
        #                 "library": lib_name
        #             })
        
        # For now, return mock data
        return jsonify({
            "success": True,
            "components": MOCK_COMPONENTS,
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
    Get all available footprints from KiCad libraries
    """
    try:
        if not KICAD_AVAILABLE:
            # Return mock data if KiCad is not available
            return jsonify({
                "success": True,
                "footprints": [
                    {"name": "R_0805_2012Metric", "library": "Resistor_SMD"},
                    {"name": "C_0805_2012Metric", "library": "Capacitor_SMD"},
                    {"name": "LED_0805_2012Metric", "library": "LED_SMD"},
                    {"name": "TQFP-32_7x7mm_P0.8mm", "library": "Package_QFP"},
                    {"name": "TO-92_Inline", "library": "Package_TO_SOT_THT"}
                ],
                "source": "mock",
                "timestamp": datetime.now().isoformat()
            })
        
        # If KiCad is available, we would fetch real footprint data here
        # This is a placeholder for actual KiCad footprint parsing
        footprints = []
        
        # Example of how we might parse KiCad footprint libraries
        # fp_path = "/usr/share/kicad/footprints"
        # for lib_dir in os.listdir(fp_path):
        #     lib_path = os.path.join(fp_path, lib_dir)
        #     if os.path.isdir(lib_path):
        #         for fp_file in os.listdir(lib_path):
        #             if fp_file.endswith(".kicad_mod"):
        #                 fp_name = os.path.splitext(fp_file)[0]
        #                 footprints.append({
        #                     "name": fp_name,
        #                     "library": lib_dir
        #                 })
        
        # For now, return mock data
        return jsonify({
            "success": True,
            "footprints": [
                {"name": "R_0805_2012Metric", "library": "Resistor_SMD"},
                {"name": "C_0805_2012Metric", "library": "Capacitor_SMD"},
                {"name": "LED_0805_2012Metric", "library": "LED_SMD"},
                {"name": "TQFP-32_7x7mm_P0.8mm", "library": "Package_QFP"},
                {"name": "TO-92_Inline", "library": "Package_TO_SOT_THT"}
            ],
            "source": "kicad",
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route('/api/symbols', methods=['GET'])
def get_symbols():
    """
    Get all available symbols from KiCad libraries
    """
    try:
        if not KICAD_AVAILABLE:
            # Return mock data if KiCad is not available
            return jsonify({
                "success": True,
                "symbols": [
                    {"name": "R", "library": "Device", "type": "resistor"},
                    {"name": "C", "library": "Device", "type": "capacitor"},
                    {"name": "LED", "library": "Device", "type": "led"},
                    {"name": "ATmega328P-AU", "library": "MCU_Microchip_ATmega", "type": "ic"},
                    {"name": "2N2222", "library": "Transistor_BJT", "type": "transistor"}
                ],
                "source": "mock",
                "timestamp": datetime.now().isoformat()
            })
        
        # If KiCad is available, we would fetch real symbol data here
        # This is a placeholder for actual KiCad symbol parsing
        symbols = []
        
        # Example of how we might parse KiCad symbol libraries
        # lib_path = "/usr/share/kicad/symbols"
        # for lib_file in os.listdir(lib_path):
        #     if lib_file.endswith(".kicad_sym"):
        #         lib_name = os.path.splitext(lib_file)[0]
        #         lib = kicad_sym.KicadSymbolLib.from_file(os.path.join(lib_path, lib_file))
        #         for symbol in lib.symbols:
        #             symbols.append({
        #                 "name": symbol.name,
        #                 "library": lib_name,
        #                 "type": determine_component_type(symbol)
        #             })
        
        # For now, return mock data
        return jsonify({
            "success": True,
            "symbols": [
                {"name": "R", "library": "Device", "type": "resistor"},
                {"name": "C", "library": "Device", "type": "capacitor"},
                {"name": "LED", "library": "Device", "type": "led"},
                {"name": "ATmega328P-AU", "library": "MCU_Microchip_ATmega", "type": "ic"},
                {"name": "2N2222", "library": "Transistor_BJT", "type": "transistor"}
            ],
            "source": "kicad",
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route('/api/component/<component_id>', methods=['GET'])
def get_component_details(component_id):
    """
    Get detailed information about a specific component
    """
    try:
        # Find the component in our mock data
        component = next((c for c in MOCK_COMPONENTS if c["id"] == component_id), None)
        
        if not component:
            return jsonify({
                "success": False,
                "error": f"Component with ID {component_id} not found"
            }), 404
        
        return jsonify({
            "success": True,
            "component": component,
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route('/api/convert-schematic', methods=['POST'])
def convert_schematic():
    """
    Convert a schematic to a PCB layout
    """
    try:
        data = request.json
        
        if not data or "components" not in data:
            return jsonify({
                "success": False,
                "error": "Invalid request data. 'components' field is required."
            }), 400
        
        # In a real implementation, we would use KiCad's Python API to convert
        # the schematic to a PCB layout. For now, we'll just return a mock response.
        
        return jsonify({
            "success": True,
            "message": "Schematic converted to PCB layout",
            "pcbComponents": data["components"],
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

