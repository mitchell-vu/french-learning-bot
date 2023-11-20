from openai import OpenAI
import os 
import json

OPEN_AI_KEY = os.environ.get("OPEN_AI_KEY")

client = OpenAI(api_key=OPEN_AI_KEY)

embedding = client.embeddings.create(
    model="text-embedding-ada-002",
  input="The food was delicious and the waiter...",
  encoding_format="float"
)



print(embedding)