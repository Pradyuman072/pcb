"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var child_process_1 = require("child_process");
var util_1 = require("util");
var execPromise = (0, util_1.promisify)(child_process_1.exec);
// Clone repositories if not exists
function cloneRepositories() {
    return __awaiter(this, void 0, void 0, function () {
        var symbolsPath, footprintsPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    symbolsPath = path_1.default.join(__dirname, 'kicad-symbols');
                    footprintsPath = path_1.default.join(__dirname, 'kicad-footprints');
                    if (!!fs_1.default.existsSync(symbolsPath)) return [3 /*break*/, 2];
                    console.log('Cloning symbols repository...');
                    return [4 /*yield*/, execPromise('git clone https://gitlab.com/kicad/libraries/kicad-symbols.git')];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!!fs_1.default.existsSync(footprintsPath)) return [3 /*break*/, 4];
                    console.log('Cloning footprints repository...');
                    return [4 /*yield*/, execPromise('git clone https://gitlab.com/kicad/libraries/kicad-footprints.git')];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Parse KiCad symbol library files
function parseSymbolFile(filePath) {
    var content = fs_1.default.readFileSync(filePath, 'utf8');
    var components = [];
    // Basic regex pattern to extract component definitions
    var symbolRegex = /\(symbol\s+"([^"]+)"([\s\S]*?)\)/g;
    var propertyRegex = /\(property\s+"([^"]+)"\s+"([^"]+)"/g;
    var match;
    while ((match = symbolRegex.exec(content)) !== null) {
        var name_1 = match[1];
        var symbolContent = match[2];
        var component = {
            name: name_1,
            type: determineComponentType(name_1),
        };
        // Extract properties
        var propMatch = void 0;
        while ((propMatch = propertyRegex.exec(symbolContent)) !== null) {
            var propName = propMatch[1];
            var propValue = propMatch[2];
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
function determineComponentType(name) {
    var lowerName = name.toLowerCase();
    if (lowerName.includes('resistor') || lowerName.includes('r_')) {
        return 'resistor';
    }
    else if (lowerName.includes('capacitor') || lowerName.includes('c_')) {
        return 'capacitor';
    }
    else if (lowerName.includes('inductor') || lowerName.includes('l_')) {
        return 'inductor';
    }
    else if (lowerName.includes('diode') || lowerName.includes('d_')) {
        return 'diode';
    }
    else if (lowerName.includes('transistor') || lowerName.includes('q_')) {
        return 'transistor';
    }
    else if (lowerName.includes('ic')) {
        return 'ic';
    }
    else if (lowerName.includes('led')) {
        return 'led';
    }
    else if (lowerName.includes('switch') || lowerName.includes('sw_')) {
        return 'switch';
    }
    else if (lowerName.includes('voltmeter')) {
        return 'voltmeter';
    }
    else if (lowerName.includes('ammeter')) {
        return 'ammeter';
    }
    else if (lowerName.includes('oscilloscope')) {
        return 'oscilloscope';
    }
    else if (lowerName.includes('power')) {
        return 'power_supply';
    }
    else if (lowerName.includes('gnd')) {
        return 'ground';
    }
    else if (lowerName.includes('connector') || lowerName.includes('conn_')) {
        return 'connector';
    }
    else if (lowerName.includes('potentiometer') || lowerName.includes('pot_')) {
        return 'potentiometer';
    }
    else if (lowerName.includes('fuse')) {
        return 'fuse';
    }
    else if (lowerName.includes('relay')) {
        return 'relay';
    }
    else if (lowerName.includes('transformer')) {
        return 'transformer';
    }
    else {
        return 'ic'; // Default to IC for unknown components
    }
}
// Extract pin information from symbol content
function extractPinsFromSymbol(symbolContent) {
    var pinRegex = /\(pin\s+([^\s]+)\s+([^\s]+)\s+\(at\s+([^\s]+)\s+([^\s]+)[^\)]+\)\s+\(length\s+([^\s]+)\)[^\)]*\)/g;
    var pins = [];
    var match;
    while ((match = pinRegex.exec(symbolContent)) !== null) {
        var type = match[1] === 'power_in' ? 'positive' :
            match[1] === 'power_out' ? 'negative' : 'other';
        var x = parseFloat(match[3]);
        var y = parseFloat(match[4]);
        pins.push({ x: x, y: y, type: type });
    }
    // Calculate width and height from pin positions
    var minX = 0, maxX = 0, minY = 0, maxY = 0;
    if (pins.length > 0) {
        minX = Math.min.apply(Math, pins.map(function (p) { return p.x; }));
        maxX = Math.max.apply(Math, pins.map(function (p) { return p.x; }));
        minY = Math.min.apply(Math, pins.map(function (p) { return p.y; }));
        maxY = Math.max.apply(Math, pins.map(function (p) { return p.y; }));
    }
    // Generate SVG path for schematic representation
    var svgPath = generateSchemticSvgFromSymbol(symbolContent);
    return {
        width: Math.max(2, Math.abs(maxX - minX) / 2.54),
        height: Math.max(2, Math.abs(maxY - minY) / 2.54),
        pins: pins,
        svgPath: svgPath,
        schematicSymbol: svgPath
    };
}
// Generate SVG path from symbol polygons and lines
function generateSchemticSvgFromSymbol(symbolContent) {
    var polylineRegex = /\(polyline\s+\(pts\s+([\s\S]*?)\)\s+\(stroke[^\)]*\)/g;
    var rectRegex = /\(rectangle\s+\(start\s+([^\s]+)\s+([^\s]+)\)\s+\(end\s+([^\s]+)\s+([^\s]+)\)/g;
    var svgPath = '';
    // Extract polylines
    var match;
    while ((match = polylineRegex.exec(symbolContent)) !== null) {
        var points = match[1].trim().split(' ').filter(function (p) { return p.startsWith('('); });
        if (points.length > 0) {
            var coords = points.map(function (p) {
                var nums = p.replace(/[\(\)]/g, '').split(' ');
                return "".concat(nums[0], ",").concat(nums[1]);
            });
            svgPath += "M".concat(coords[0], " ");
            for (var i = 1; i < coords.length; i++) {
                svgPath += "L".concat(coords[i], " ");
            }
        }
    }
    // Extract rectangles
    while ((match = rectRegex.exec(symbolContent)) !== null) {
        var startX = match[1];
        var startY = match[2];
        var endX = match[3];
        var endY = match[4];
        svgPath += "M".concat(startX, ",").concat(startY, " L").concat(endX, ",").concat(startY, " L").concat(endX, ",").concat(endY, " L").concat(startX, ",").concat(endY, " Z ");
    }
    return svgPath.trim();
}
// Add electrical characteristics based on component type
function addElectricalCharacteristics(component) {
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
function parseFootprintFiles(directory) {
    var footprints = {};
    function processDir(dir) {
        var files = fs_1.default.readdirSync(dir);
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            var fullPath = path_1.default.join(dir, file);
            var stat = fs_1.default.statSync(fullPath);
            if (stat.isDirectory()) {
                processDir(fullPath);
            }
            else if (file.endsWith('.kicad_mod')) {
                var content = fs_1.default.readFileSync(fullPath, 'utf8');
                var name_2 = file.replace('.kicad_mod', '');
                // Extract pad information for pins
                var padRegex = /\(pad\s+"([^"]+)"\s+[^\(]+\(at\s+([^\s]+)\s+([^\s]+)[^\)]+\)/g;
                var pins = [];
                var match = void 0;
                while ((match = padRegex.exec(content)) !== null) {
                    var padNum = match[1];
                    var x = parseFloat(match[2]);
                    var y = parseFloat(match[3]);
                    // Determine pin type based on pad number
                    var type = "other";
                    if (padNum === "1" || padNum === "A" || padNum === "+" || padNum === "VCC" || padNum === "VDD") {
                        type = "positive";
                    }
                    else if (padNum === "2" || padNum === "K" || padNum === "-" || padNum === "GND" || padNum === "VSS") {
                        type = "negative";
                    }
                    pins.push({ x: x, y: y, type: type });
                }
                // Calculate size from pads
                var minX = 0, maxX = 0, minY = 0, maxY = 0;
                if (pins.length > 0) {
                    minX = Math.min.apply(Math, pins.map(function (p) { return p.x; }));
                    maxX = Math.max.apply(Math, pins.map(function (p) { return p.x; }));
                    minY = Math.min.apply(Math, pins.map(function (p) { return p.y; }));
                    maxY = Math.max.apply(Math, pins.map(function (p) { return p.y; }));
                }
                footprints[name_2] = {
                    width: Math.max(2, Math.abs(maxX - minX) / 2.54),
                    height: Math.max(2, Math.abs(maxY - minY) / 2.54),
                    pins: pins
                };
            }
        }
    }
    processDir(directory);
    return footprints;
}
// Main function to process libraries and generate JSON
function processKiCadLibraries() {
    return __awaiter(this, void 0, void 0, function () {
        var symbolsDir, footprintsDir, components, symbolFiles, _i, symbolFiles_1, file, filePath, fileComponents, footprints, _loop_1, _a, components_1, component, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, cloneRepositories()];
                case 1:
                    _d.sent();
                    symbolsDir = path_1.default.join(__dirname, 'kicad-symbols');
                    footprintsDir = path_1.default.join(__dirname, 'kicad-footprints');
                    components = [];
                    symbolFiles = fs_1.default.readdirSync(symbolsDir)
                        .filter(function (file) { return file.endsWith('.kicad_sym') || file.endsWith('.lib'); });
                    for (_i = 0, symbolFiles_1 = symbolFiles; _i < symbolFiles_1.length; _i++) {
                        file = symbolFiles_1[_i];
                        filePath = path_1.default.join(symbolsDir, file);
                        fileComponents = parseSymbolFile(filePath);
                        components.push.apply(components, fileComponents);
                    }
                    footprints = parseFootprintFiles(footprintsDir);
                    _loop_1 = function (component) {
                        // Simple matching logic - could be improved for production
                        var possibleFootprints = Object.entries(footprints)
                            .filter(function (_a) {
                            var name = _a[0];
                            return name.toLowerCase().includes(component.type.toLowerCase());
                        });
                        if (possibleFootprints.length > 0) {
                            // Just take the first matching footprint for simplicity
                            var _e = possibleFootprints[0], _ = _e[0], footprint = _e[1];
                            if (footprint.pins && footprint.pins.length > 0) {
                                component.footprint = __assign(__assign({}, component.footprint), { width: footprint.width || ((_b = component.footprint) === null || _b === void 0 ? void 0 : _b.width) || 2, height: footprint.height || ((_c = component.footprint) === null || _c === void 0 ? void 0 : _c.height) || 2, pins: footprint.pins });
                            }
                        }
                    };
                    // Match footprints with components where possible
                    for (_a = 0, components_1 = components; _a < components_1.length; _a++) {
                        component = components_1[_a];
                        _loop_1(component);
                    }
                    // Write to JSON file
                    fs_1.default.writeFileSync(path_1.default.join(__dirname, 'component-definitions.json'), JSON.stringify(components, null, 2));
                    console.log("Successfully processed ".concat(components.length, " components"));
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _d.sent();
                    console.error('Error processing KiCad libraries:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Run the script
processKiCadLibraries();
