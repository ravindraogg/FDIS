import requests
import time
import random
import json

API_URL = "http://localhost:8000/predict"

def generate_normal_tx(tx_id, current_time):
    return {
        "id": f"TXN_{tx_id}",
        "from": f"USER_{random.randint(100, 200)}",
        "to": f"USER_{random.randint(300, 400)}",
        "amount": round(random.randint(10, 500) + random.random(), 2),
        "timestamp": current_time
    }

def inject_layering_fraud(tx_id, current_time):
    # A -> B -> C -> A
    amt = round(random.randint(2000, 5000) + random.random(), 2)
    return [
        {
            "id": f"TXN_FRD_{tx_id}",
            "from": "FRAUD_9901",
            "to": "FRAUD_9902",
            "amount": amt,
            "timestamp": current_time + 1
        },
        {
            "id": f"TXN_FRD_{tx_id+1}",
            "from": "FRAUD_9902",
            "to": "FRAUD_9903",
            "amount": amt,
            "timestamp": current_time + 2
        },
        {
            "id": f"TXN_FRD_{tx_id+2}",
            "from": "FRAUD_9903",
            "to": "FRAUD_9901",
            "amount": amt,
            "timestamp": current_time + 3
        }
    ]

def inject_smurfing_fraud(tx_id, current_time):
    # Rapid transactions from A to B (same entities)
    amt = 999.00
    return [
        {
            "id": f"TXN_SMR_{tx_id+i}",
            "from": "SMURF_007",
            "to": "TARGET_123",
            "amount": amt,
            "timestamp": current_time + i
        } for i in range(4)
    ]

def simulate_stream():
    print("==================================================")
    print("📡 Initiating Real-Time Data Stream Payload Tester")
    print(f"Targeting Intelligence API: {API_URL}")
    print("==================================================\n")
    
    tx_id = 1000
    current_time = int(time.time())

    # Send 20 payloads roughly representing continuous streaming
    for step in range(15):
        time.sleep(1.5) # Simulate slight network latency / pacing
        batch = [generate_normal_tx(tx_id, current_time)]
        
        # Inject random layered anomalies every few loops
        if step == 3:
            print("\n>> 😈 INJECTING MALICIOUS LAYERED CYCLE INTO STREAM...")
            batch.extend(inject_layering_fraud(tx_id, current_time))
            tx_id += 3
        elif step == 8:
            print("\n>> 😈 INJECTING SMURFING/RAPID BURSTS INTO STREAM...")
            batch.extend(inject_smurfing_fraud(tx_id, current_time))
            tx_id += 4
            
        try:
            response = requests.post(API_URL, json=batch)
            if response.status_code == 200:
                results = response.json().get("results", [])
                for res in results:
                    if res.get("anomaly"):
                        print(f"🚨 [ALERT] {res['risk_level'].upper()} | PRIORITY {res['priority']} | {res['fraud_type']}")
                        print(f"   Score: {res['fused_risk_score']} | Confidence: {res['model_confidence']}")
                        print(f"   💡 AI Explains: {res['explanation']}\n")
                    else:
                        print(f"✅ Cleared: {res['transaction_id']} (Normal Volume)")
            else:
                print(f"Server Error: {response.text}")
        except requests.exceptions.ConnectionError:
            print("API Server Offline! Start the FastAPI service first.")
            break
            
        tx_id += 1
        current_time += 15

if __name__ == "__main__":
    simulate_stream()
