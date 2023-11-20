import chromadb 
chroma_client = chromadb.Client()

collection = chroma_client.create_collection(name = "my_collection")
collection.add(
    documents = ["My name is TCS","My name is not TCS"],
    metadatas = [{"source":"name is true"},{"source":"name is false"}],
    ids = ["id1","id2"],
)

result = collection.query(
    query_texts = ["what's my name?"],
    n_results = 1,
)

print(result)