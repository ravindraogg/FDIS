import pandas as pd
import requests
import time
import json
import logging
import sys
import os

# Enforce UTF-8 on Windows Consoles natively to support streaming Emojis
sys.stdout.reconfigure(encoding='utf-8')

# -------------------------------------------------------------
# KAFKA-STYLE LOGGING CONFIGURATION
# This mirrors both to your console and actively saves it locally
# into "streaming_fraud_logs.txt"
# -------------------------------------------------------------
LOG_FILE = "streaming_fraud_logs.txt"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE, mode='w', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

# Target the Node.js Gateway
NODE_API_URL = "http://localhost:5000/api/monitor"
# Target the 5 lakh dataset exact path
CSV_PATH = r"D:\Hackethon-Projects\ideaHackathon\model\financial_data_5lakh.csv"

def stream_historical_data_as_realtime():
    if not os.path.exists(CSV_PATH):
        logging.error(f"❌ Dataset not found at: {CSV_PATH}")
        return

    logging.info(f"📂 Loading heavy dataset into Kafka Streamer: {CSV_PATH}")
    # Load just a chunk or read in chunks if memory is sparse. 
    # Pandas handles 500k easily, so we ingest it fully.
    df = pd.read_csv(CSV_PATH)
    
    # Precompute all timestamps to UNIX epoch format instantly for Kafka streaming
    logging.info("⏳ Syncing Historical Timestamps to Epoch Windows...")
    df['timestamp_epoch'] = pd.to_datetime(df['Timestamp']).astype('int64') // 10**9
    
    total_records = len(df)
    logging.info(f"🚀 KAFKA STREAM INITIALIZED. Total Events Ready: {total_records}")
    logging.info("📡 Beginning continuous POST transmission to Node.js Microservice Gateway...")
    
    batch_size = 5  # Streaming 5 transactions per window (Adjust for high-load tests)
    batch = []
    
    for index, row in df.iterrows():
        tx = {
            "id": f"KAFKA_TXN_{index}",
            "from": str(row['Sender_Acc']),
            "to": str(row['Receiver_Acc']),
            "amount": float(row['Amount']),
            "timestamp": int(row['timestamp_epoch'])
        }
        batch.append(tx)
        
        # When Kafka batch is filled, transmit!
        if len(batch) >= batch_size:
            try:
                response = requests.post(NODE_API_URL, json=batch)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("intelligence", [])
                    
                    # Parse intelligence results natively
                    for res in results:
                        if res.get("anomaly"):
                            logging.warning(
                                f"🚨 [FRAUD ALERT] | Level: {res['risk_level']} | Priority: {res['priority']}\n"
                                f"   ├─ Type: {res['fraud_type']}\n"
                                f"   ├─ AI Fused Score: {res['fused_risk_score']}\n"
                                f"   └─ Narrative: {res['explanation']}"
                            )
                        else:
                            # Standard continuous streaming clear signals
                            logging.info(f"✅ [CLEARED] {res['transaction_id']}")
                else:
                    logging.error(f"Node.js Gateway Error [Code {response.status_code}]: {response.text}")
            
            except requests.exceptions.ConnectionError:
                logging.error("❌ Link Severed! Ensure Node.js (Port 5000) and FastAPI (Port 8000) are live.")
                time.sleep(3)
            
            # Clear window queue and simulate organic Kafka pacing flow
            batch = []
            time.sleep(1.0) # Pause 1 second between payload blasts

if __name__ == "__main__":
    stream_historical_data_as_realtime()
