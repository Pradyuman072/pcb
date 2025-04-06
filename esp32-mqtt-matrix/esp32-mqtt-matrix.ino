// ESP32 compatible MAX7219 LED matrix controller
#include <SPI.h>

// MAX7219 registers
#define REG_NOOP         0x00
#define REG_DIGIT0       0x01
#define REG_DIGIT1       0x02
#define REG_DIGIT2       0x03
#define REG_DIGIT3       0x04
#define REG_DIGIT4       0x05
#define REG_DIGIT5       0x06
#define REG_DIGIT6       0x07
#define REG_DIGIT7       0x08
#define REG_DECODEMODE   0x09
#define REG_INTENSITY    0x0A
#define REG_SCANLIMIT    0x0B
#define REG_SHUTDOWN     0x0C
#define REG_DISPLAYTEST  0x0F

// MAX7219 configuration
#define DIN_PIN     23      // MOSI pin connected to the MAX7219
#define CS_PIN      5       // Chip select pin
#define CLK_PIN     18      // Clock pin
#define NUM_DEVICES 4       // Number of MAX7219 devices (4 matrices)

// Time tracking for animation
unsigned long previousMillis = 0;
int patternIndex = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 MAX7219 LED Matrix Controller initialized");
  
  // Configure pins
  pinMode(DIN_PIN, OUTPUT);
  pinMode(CS_PIN, OUTPUT);
  pinMode(CLK_PIN, OUTPUT);
  digitalWrite(CS_PIN, HIGH);
  
  // Initialize SPI
  SPI.begin(CLK_PIN, -1, DIN_PIN, CS_PIN);
  
  // Initialize all MAX7219 devices
  for (int device = 0; device < NUM_DEVICES; device++) {
    sendCommand(device, REG_SHUTDOWN, 0x01);     // Wake up from shutdown mode
    sendCommand(device, REG_DISPLAYTEST, 0x00);  // Disable display test
    sendCommand(device, REG_DECODEMODE, 0x00);   // No BCD decode
    sendCommand(device, REG_SCANLIMIT, 0x07);    // Scan all 8 digits
    sendCommand(device, REG_INTENSITY, 0x08);    // Set intensity (0-15)
    clearDisplay(device);                        // Clear display
  }
}

// Send command to MAX7219
void sendCommand(int device, byte reg, byte data) {
  digitalWrite(CS_PIN, LOW);
  
  // Send data to all devices before the target device
  for (int i = NUM_DEVICES - 1; i > device; i--) {
    SPI.transfer(REG_NOOP);
    SPI.transfer(0x00);
  }
  
  // Send command to target device
  SPI.transfer(reg);
  SPI.transfer(data);
  
  // Send data to all devices after the target device
  for (int i = device - 1; i >= 0; i--) {
    SPI.transfer(REG_NOOP);
    SPI.transfer(0x00);
  }
  
  digitalWrite(CS_PIN, HIGH);
}

// Clear display
void clearDisplay(int device) {
  for (int i = 0; i < 8; i++) {
    sendCommand(device, i + 1, 0x00);
  }
}

// Set LED state at position
void setLed(int device, int row, int col, bool state) {
  byte data = 0x00;
  
  // Read current state of the row
  switch (col) {
    case 0: data = 0x01; break;
    case 1: data = 0x02; break;
    case 2: data = 0x04; break;
    case 3: data = 0x08; break;
    case 4: data = 0x10; break;
    case 5: data = 0x20; break;
    case 6: data = 0x40; break;
    case 7: data = 0x80; break;
  }
  
  if (state) {
    // Set LED on
    sendCommand(device, row + 1, data);
  } else {
    // Set LED off
    sendCommand(device, row + 1, 0x00);
  }
}

// Set column data at position
void setColumn(int device, int col, byte data) {
  for (int row = 0; row < 8; row++) {
    bool state = bitRead(data, row);
    setLed(device, row, col, state);
  }
}

// Pattern 1: Moving dots
void movingDots() {
  static int position = 0;
  
  // Clear all displays
  for (int device = 0; device < NUM_DEVICES; device++) {
    clearDisplay(device);
  }
  
  // Calculate positions for dots
  for (int i = 0; i < 4; i++) {
    int dotPos = (position + (i * 8)) % 32;
    int device = dotPos / 8;
    int col = dotPos % 8;
    
    // Create a diagonal line of dots
    for (int row = 0; row < 8; row++) {
      int displayRow = (row + i) % 8;
      setLed(device, displayRow, col, true);
    }
  }
  
  position = (position + 1) % 32;
}

// Pattern 2: Scrolling pattern
void scrollingPattern() {
  static int scrollPos = 0;
  
  // Define pattern for each column (8 pixels tall)
  byte pattern[16] = {
    B10101010, B01010101,
    B11001100, B00110011,
    B10001000, B00100010,
    B11100111, B00111001,
    B10101010, B01010101,
    B11110000, B00001111,
    B10000001, B01111110,
    B11111111, B00000000
  };
  
  // Clear all displays
  for (int device = 0; device < NUM_DEVICES; device++) {
    clearDisplay(device);
  }
  
  // Display pattern columns with scrolling
  for (int col = 0; col < 8; col++) {
    for (int device = 0; device < NUM_DEVICES; device++) {
      int patternIndex = (col + scrollPos + (device * 2)) % 16;
      byte columnData = pattern[patternIndex];
      
      // Set each LED in the column
      for (int row = 0; row < 8; row++) {
        bool state = bitRead(columnData, row);
        setLed(device, row, col, state);
      }
    }
  }
  
  scrollPos = (scrollPos + 1) % 16;
}

// Pattern 3: Bouncing ball
void bouncingBall() {
  static float ballX = 0;
  static float ballY = 0;
  static float speedX = 0.2;
  static float speedY = 0.15;
  
  // Clear all displays
  for (int device = 0; device < NUM_DEVICES; device++) {
    clearDisplay(device);
  }
  
  // Update ball position
  ballX += speedX;
  ballY += speedY;
  
  // Bounce off edges
  if (ballX < 0 || ballX > 31) {
    speedX = -speedX;
    ballX += speedX;
  }
  
  if (ballY < 0 || ballY > 7) {
    speedY = -speedY;
    ballY += speedY;
  }
  
  // Draw the ball
  int device = int(ballX) / 8;
  int col = int(ballX) % 8;
  int row = int(ballY);
  
  setLed(device, row, col, true);
}

// Pattern 4: Wave pattern
void wavePattern() {
  static int waveOffset = 0;
  
  // Clear all displays
  for (int device = 0; device < NUM_DEVICES; device++) {
    clearDisplay(device);
  }
  
  // Calculate wave pattern
  for (int x = 0; x < 32; x++) {
    // Sine wave calculation with 2 wavelengths across display
    float angle = ((float)x / 32.0) * 2.0 * PI * 2.0;
    // Adjust wave position based on offset
    angle += (float)waveOffset / 10.0;
    // Calculate y position (0-7)
    int y = 3.5 + 3.5 * sin(angle);
    
    // Set the LED
    int device = x / 8;
    int col = x % 8;
    setLed(device, y, col, true);
  }
  
  waveOffset = (waveOffset + 1) % 63;
}

// Pattern 5: Expanding squares
void expandingSquares() {
  static int squareSize = 0;
  
  // Clear all displays
  for (int device = 0; device < NUM_DEVICES; device++) {
    clearDisplay(device);
  }
  
  // Draw squares in each matrix
  for (int device = 0; device < NUM_DEVICES; device++) {
    int size = (squareSize + device) % 5;
    
    // If size is 0, draw nothing
    if (size == 0) continue;
    
    // Calculate the starting and ending positions for the square
    int startRow = 4 - size;
    int endRow = 3 + size;
    int startCol = 4 - size;
    int endCol = 3 + size;
    
    // Draw the square (just the outline)
    for (int col = startCol; col <= endCol; col++) {
      if (col >= 0 && col < 8) {
        if (startRow >= 0) setLed(device, startRow, col, true);
        if (endRow < 8) setLed(device, endRow, col, true);
      }
    }
    
    for (int row = startRow + 1; row < endRow; row++) {
      if (row >= 0 && row < 8) {
        if (startCol >= 0) setLed(device, row, startCol, true);
        if (endCol < 8) setLed(device, row, endCol, true);
      }
    }
  }
  
  squareSize = (squareSize + 1) % 5;
}

// List of pattern functions
typedef void (*PatternFunction)();
PatternFunction patterns[] = {
  movingDots,
  scrollingPattern,
  bouncingBall,
  wavePattern,
  expandingSquares
};
const int NUM_PATTERNS = sizeof(patterns) / sizeof(patterns[0]);

void loop() {
  unsigned long currentMillis = millis();
  
  // Update pattern every 100ms
  if (currentMillis - previousMillis >= 100) {
    previousMillis = currentMillis;
    
    // Run the current pattern
    patterns[patternIndex]();
  }
  
  // Change patterns every 10 seconds
  if ((currentMillis / 10000) % NUM_PATTERNS != patternIndex) {
    patternIndex = (currentMillis / 10000) % NUM_PATTERNS;
    Serial.print("Switching to pattern: ");
    Serial.println(patternIndex);
  }
}