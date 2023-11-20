VERIFY_TOKEN=

curl -X GET "localhost:8080/webhook?hub.verify_token=$VERIFY_TOKEN&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"
