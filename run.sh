#!/bin/bash
# WordCraft Startup Script

echo "Checking port 8080..."
fuser -k 8080/tcp 2>/dev/null || true

echo "Starting WordCraft server on http://localhost:8080..."
java -Xmx300m -jar target/wordcraft-1.0.0.jar
