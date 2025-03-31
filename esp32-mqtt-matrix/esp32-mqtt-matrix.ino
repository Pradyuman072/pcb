#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <FastLED.h>
#include <WiFiManager.h>

// MQTT Broker settings
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_user = "mqtt_user";
const char* mqtt_password = "mqtt_password";

// MQTT topics
const char* matrix_data_topic = "esp32/matrix/data";
const char* matrix_status_topic = "esp32/matrix/status";
const char* wifi_config_topic = "esp32/wifi/config";

// LED Matrix settings
const int MATRIX_SIZE = 64;
const int NUM_LEDS = MATRIX_SIZE * MATRIX_SIZE;

// Matrix data
uint8_t matrix[MATRIX_SIZE][MATRIX_SIZE] = {0};

// WiFi and MQTT clients
WiFiClient espClient;
PubSubClient client(espClient);
WiFiManager wm;

// LED matrix pins
const int DATA_PIN = 5;
CRGB leds[NUM_LEDS];

void setup_wifi();
void callback(char* topic, byte* payload, unsigned int length);
void reconnect();
void updateMatrix();
void sendStatus(const char* status);

void setup() {
  Serial.begin(115200);
  
  // Initialize LED matrix
  FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(50);
  
  // Connect to WiFi using WiFiManager
  if (!wm.autoConnect("ESP32-Config", "12345678")) {
    Serial.println("Failed to connect. Restarting...");
    ESP.restart();
  }
  
  Serial.print("Connected to Wi-Fi: ");
  Serial.println(WiFi.SSID());
  
  // Set up MQTT client
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  // Clear the matrix
  memset(matrix, 0, sizeof(matrix));
  updateMatrix();
  
  Serial.println("ESP32 LED Matrix Controller initialized");
  sendStatus("ESP32 initialized with Wi-Fi Manager");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  delay(10);
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  
  char message[length + 1];
  for (unsigned int i = 0; i < length; i++) {
    message[i] = (char)payload[i];
    Serial.print((char)payload[i]);
  }
  message[length] = '\0';
  Serial.println();
  
  if (strcmp(topic, matrix_data_topic) == 0) {
    DynamicJsonDocument doc(65536);
    DeserializationError error = deserializeJson(doc, message);
    
    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.c_str());
      sendStatus("Error: Failed to parse JSON");
      return;
    }
    
    const char* componentName = doc["component"];
    JsonArray matrixData = doc["matrix"];
    
    Serial.print("Received component: ");
    Serial.println(componentName);
    
    memset(matrix, 0, sizeof(matrix));
    
    if (matrixData.size() == MATRIX_SIZE) {
      for (int y = 0; y < MATRIX_SIZE; y++) {
        JsonArray row = matrixData[y];
        if (row.size() == MATRIX_SIZE) {
          for (int x = 0; x < MATRIX_SIZE; x++) {
            matrix[y][x] = row[x];
          }
        }
      }
      
      updateMatrix();
      sendStatus("ACK: Matrix updated");
    } else {
      sendStatus("Error: Invalid matrix dimensions");
    }
  } else if (strcmp(topic, wifi_config_topic) == 0) {
    DynamicJsonDocument doc(256);
    DeserializationError error = deserializeJson(doc, message);
    
    if (error) {
      sendStatus("Error: Failed to parse Wi-Fi config");
      return;
    }
    
    const char* ssid = doc["ssid"];
    const char* password = doc["password"];
    
    if (ssid && strlen(ssid) > 0) {
      Serial.println("Received new Wi-Fi credentials");
      WiFi.begin(ssid, password);
      
      int attempts = 0;
      while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
      }
      
      if (WiFi.status() == WL_CONNECTED) {
        sendStatus("Wi-Fi: Connected to new network");
        Serial.println("Connected to new Wi-Fi network");
      } else {
        sendStatus("Wi-Fi: Failed to connect to new network");
        Serial.println("Failed to connect to new Wi-Fi network");
      }
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("connected");
      client.subscribe(matrix_data_topic);
      client.subscribe(wifi_config_topic);
      sendStatus("ESP32 reconnected to MQTT");
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
      int pixelIndex = y * MATRIX_SIZE + (y % 2 == 0 ? x : MATRIX_SIZE - 1 - x);
      
      switch (matrix[y][x]) {
        case 0: leds[pixelIndex] = CRGB::Black; break;
        case 1: leds[pixelIndex] = CRGB::Green; break;
        case 2: leds[pixelIndex] = CRGB::Red; break;
        case 3: leds[pixelIndex] = CRGB::White; break;
        default: leds[pixelIndex] = CRGB::Blue; break;
      }
    }
  }
  FastLED.show();
}

void sendStatus(const char* status) {
  client.publish(matrix_status_topic, status);
  Serial.print("Status: ");
  Serial.println(status);
}