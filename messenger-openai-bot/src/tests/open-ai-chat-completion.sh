OPENAI_API_KEY=

curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
     "model": "gpt-3.5-turbo",
     "messages": [{"role": "user", "content": "Act in Zohra Shakti interpreting today tarot card of The Hanged Man in a paragraph"}],
     "temperature": 1
   }'