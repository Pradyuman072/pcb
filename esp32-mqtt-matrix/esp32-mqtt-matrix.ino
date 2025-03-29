/*
 * ESP32 MQTT 64x64 LED Matrix Controller
 * 
 * This code connects an ESP32 to MQTT and controls a 64x64 LED matrix
 * based on the matrix data received from the circuit designer application.
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <FastLED.h>

// WiFi credentials
const char* ssid = "Pradyuman";
const char* password = "12345678";

// MQTT Broker settings
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_user = "mqtt_user";
const char* mqtt_password = "mqtt_password";

// MQTT topics
const char* matrix_data_topic = "esp32/matrix/data";
const char* matrix_status_topic = "esp32/matrix/status";

// LED Matrix settings
const int MATRIX_SIZE = 64;
const int NUM_LEDS = MATRIX_SIZE * MATRIX_SIZE;

// Matrix data
uint8_t matrix[MATRIX_SIZE][MATRIX_SIZE] = {0};

// WiFi and MQTT clients
WiFiClient espClient;
PubSubClient client(espClient);

// LED matrix pins
const int DATA_PIN = 5;  // Change to your actual data pin

// LED array for FastLED
CRGB leds[NUM_LEDS];

// Function prototypes
void setup_wifi();
void callback(char* topic, byte* payload, unsigned int length);
void reconnect();
void updateMatrix();
void sendStatus(const char* status);

void setup() {
  Serial.begin(115200);
  
  // Initialize LED matrix
  FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(50);  // Adjust brightness as needed
  
  // Connect to WiFi
  setup_wifi();
  
  // Set up MQTT client
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  // Clear the matrix
  memset(matrix, 0, sizeof(matrix));
  updateMatrix();
  
  Serial.println("ESP32 LED Matrix Controller initialized");
}

void loop() {
  // Maintain MQTT connection
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Other periodic tasks can go here
  delay(10);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  
  // Create a buffer for the payload
  char message[length + 1];
  for (unsigned int i = 0; i < length; i++) {
    message[i] = (char)payload[i];
    Serial.print((char)payload[i]);
  }
  message[length] = '\0';
  Serial.println();
  
  // Process matrix data
  if (strcmp(topic, matrix_data_topic) == 0) {
    // Parse JSON
    DynamicJsonDocument doc(65536);  // Increased size for 64x64 matrix
    DeserializationError error = deserializeJson(doc, message);
    
    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.c_str());
      sendStatus("Error: Failed to parse JSON");
      return;
    }
    
    // Extract component data
    const char* componentName = doc["component"];
    int orientation = doc["orientation"];
    JsonArray matrixData = doc["matrix"];
    
    Serial.print("Received component: ");
    Serial.println(componentName);
    Serial.print("Orientation: ");
    Serial.println(orientation);
    
    // Clear the matrix first
    memset(matrix, 0, sizeof(matrix));
    
    // Process matrix data - now using the full 64x64 matrix
    if (matrixData.size() == MATRIX_SIZE) {
      for (int y = 0; y < MATRIX_SIZE; y++) {
        JsonArray row = matrixData[y];
        if (row.size() == MATRIX_SIZE) {
          for (int x = 0; x < MATRIX_SIZE; x++) {
            matrix[y][x] = row[x];
          }
        }
      }
      
      // Update the physical LED matrix
      updateMatrix();
      
      // Send acknowledgment
      char statusMsg[100];
      snprintf(statusMsg, sizeof(statusMsg), "Received component: %s, orientation: %d", 
               componentName, orientation);
      sendStatus(statusMsg);
    } else {
      sendStatus("Error: Invalid matrix dimensions");
    }
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("connected");
      
      // Subscribe to topics
      client.subscribe(matrix_data_topic);
      
      // Send status message
      sendStatus("ESP32 LED Matrix Controller connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void updateMatrix() {
  for (int y = 0; y < MATRIX_SIZE; y++) {
    for (int x = 0; x < MATRIX_SIZE; x++) {
      int pixelIndex;
      if (y % 2 == 0) {
        // Even rows run left to right
        pixelIndex = y * MATRIX_SIZE + x;
      } else {
        // Odd rows run right to left
        pixelIndex = y * MATRIX_SIZE + (MATRIX_SIZE - 1 - x);
      }
      
      // Set LED color based on matrix value
      switch (matrix[y][x]) {
        case 0:  // Empty/Off
          leds[pixelIndex] = CRGB::Black;
          break;
        case 1:  // Green for value 1
          leds[pixelIndex] = CRGB::Green;
          break;
        case 2:  // Red for value 2
          leds[pixelIndex] = CRGB::Red;
          break;
        case 3:  // White for component body
          leds[pixelIndex] = CRGB::White;
          break;
        default:  // Other values - blue
          leds[pixelIndex] = CRGB::Blue;
          break;
      }
    }
  }
  
  // Update the LED matrix
  FastLED.show();
}

void sendStatus(const char* status) {
  // Send status message to MQTT
  client.publish(matrix_status_topic, status);
  Serial.print("Status: ");
  Serial.println(status);
}