from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
from predict import predict_transaction
import uvicorn

app = FastAPI(title="Fraud Intelligence API", description="Real-time transaction monitoring endpoint")

# Define the JSON Input Schema
class Transaction(BaseModel):
    id: str
    # 'from' is a reserved keyword in Python, using Field alias resolves this for JSON parsing
    sender: str = Field(alias="from")
    receiver: str = Field(alias="to")
    amount: float
    timestamp: int

@app.post("/predict")
def predict_fraud(tx_batch: List[Transaction]):
    try:
        # Convert schema format to standard dict format handled by the predict module
        batch_dicts = []
        for tx in tx_batch:
            batch_dicts.append({
                "id": tx.id,
                "from": tx.sender,
                "to": tx.receiver,
                "amount": tx.amount,
                "timestamp": tx.timestamp
            })
        
        # Push batch through the Hybrid Risk engine directly
        results = predict_transaction(batch_dicts)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Booting Real-Time Intelligence API Engine on Port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
