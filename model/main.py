import os
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field
from typing import List
import uvicorn
from predict import predict_transaction

app = FastAPI(title="Fraud Detection Microservice Configured")

# Read the token natively from the environment or default to a secure base64 string
# "ideaHackathonAPIToken2026" -> aWRlYUhhY2thdGhvbkFQSVRva2VuMjAyNg==
EXPECTED_BASE64_TOKEN = os.getenv("BASE64_TOKEN", "aWRlYUhhY2thdGhvbkFQSVRva2VuMjAyNg==")

api_key_header = APIKeyHeader(name="Authorization", auto_error=True)

def verify_token(api_key: str = Security(api_key_header)):
    # Clean the Base64 token by removing 'Bearer ' if the Nodejs backend passes it that way
    token = api_key.replace("Bearer ", "").strip()
    if token != EXPECTED_BASE64_TOKEN:
         raise HTTPException(status_code=403, detail="Unauthorized access. Base64 Token mismatch.")
    return token

class Transaction(BaseModel):
    id: str
    sender: str = Field(alias="from")
    receiver: str = Field(alias="to")
    amount: float
    timestamp: int

@app.post("/predict")
def predict_fraud(tx_batch: List[Transaction], token: str = Depends(verify_token)):
    try:
        batch_dicts = []
        for tx in tx_batch:
            batch_dicts.append({
                "id": tx.id,
                "from": tx.sender,
                "to": tx.receiver,
                "amount": tx.amount,
                "timestamp": tx.timestamp
            })
            
        results = predict_transaction(batch_dicts)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Microservice Booting natively on Port 8000 (Base64 Auth Enforced)")
    uvicorn.run(app, host="0.0.0.0", port=8000)
