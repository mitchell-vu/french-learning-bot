PORT=8080

curl -H "Content-Type: application/json" -X POST "localhost:$PORT/webhook" -d '{"object": "page", "entry": [{"messaging": [{"message": "TEST_MESSAGE"}]}]}'