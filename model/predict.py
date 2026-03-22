import json
import numpy as np
import joblib

# Global model instances for performance
_global_model = None
_global_extractor = None

def load_fraud_model_global(model_path='fraud_model.pkl'):
    global _global_model, _global_extractor
    if _global_model is None or _global_extractor is None:
        try:
            print(f"--- Loading AI Engine [Path: {model_path}] ---")
            import joblib
            pipeline = joblib.load(model_path)
            _global_model = pipeline['model']
            _global_extractor = pipeline['extractor']
            print("✅ Model & Feature Extractor Loaded successfully.")
        except Exception as e:
            print(f"❌ CRITICAL: Error loading model: {e}")
            raise e
    return _global_model, _global_extractor

def compute_multi_signal_risk_fusion(features, model_confidence):
    """
    Multi-signal Risk Fusion: Combines AI anomaly detection with explicit behavior and graph rules.
    """
    amt = features[0]
    tx_freq = features[2]
    amount_deviation = max(0, features[3])
    unusual_timing = features[4]
    
    tx_velocity = features[5]
    cycle_detected = features[7]
    unique_receivers = features[11]

    # Normalize Behavior Score (0 to 1)
    normalized_dev = min(1.0, amount_deviation / 10000)
    normalized_freq = min(1.0, tx_freq / 5.0)
    behavior_score = (normalized_dev * 0.4) + (normalized_freq * 0.4) + (unusual_timing * 0.2)

    # Normalize Graph Score (0 to 1)
    # If a cycle is detected, graph risk spikes automatically.
    normalized_velocity = min(1.0, tx_velocity / 50000)
    normalized_receivers = min(1.0, unique_receivers / 10.0)
    graph_score = 0.8 if cycle_detected == 1 else (normalized_velocity * 0.5 + normalized_receivers * 0.5)

    # Fusion Formula
    final_risk_score = (0.5 * model_confidence) + (0.3 * behavior_score) + (0.2 * graph_score)
    return final_risk_score

def get_alert_priority(risk_level, amount, tx_velocity):
    """
    Alert Priority System to prioritize operations for the banking fraud team.
    """
    if risk_level == "Critical" or (risk_level == "High" and amount > 10000) or tx_velocity > 50000:
        return "P1"
    elif risk_level == "High" or (risk_level == "Medium" and amount > 5000):
        return "P2"
    elif risk_level == "Medium":
        return "P3"
    else:
        return "P4"

def map_fraud_and_explain(features, final_risk_score):
    """
    Temporal Narrative & Fraud Types based on Multi-Signal Analysis.
    """
    amt = features[0]
    time_gap = features[1]
    tx_freq = features[2]
    amount_deviation = features[3]
    hop_count = int(features[6])
    cycle_detected = features[7]
    unique_receivers = int(features[11])
    recent_amount = features[9]

    # Convert time_gap to minutes for dynamic narrative
    minutes_gap = max(1, round(time_gap / 60))

    if cycle_detected == 1:
        fraud_type = "Layering"
        explanation = f"Within a {minutes_gap} minute span, funds roughly totaling ${amt:,.2f} moved across {hop_count} linked accounts forming a structural cyclic loop, indicating immediate layering."
    elif tx_freq >= 3 and time_gap < 300: # High frequency within 5 minutes
        fraud_type = "Smurfing"
        explanation = f"Rapid burst of {int(tx_freq)} transactions totaling ${recent_amount:,.2f} over just {minutes_gap} minutes, characteristic of smurfing and structuring tactics."
    elif unique_receivers > 5 and final_risk_score > 0.6:
        fraud_type = "Account Takeover / Disbursement"
        explanation = f"High-velocity disbursement pattern detected: funds fanning out to {unique_receivers} independent receivers with an active volume of ${recent_amount:,.2f}."
    elif amount_deviation > 5000:
        fraud_type = "Suspicious Behavior"
        explanation = f"Severe deviation of ${amount_deviation:,.2f} over the baseline average. The sheer abnormal volume of this specific transaction triggered the statistical boundary."
    elif final_risk_score > 0.5:
        fraud_type = "General Anomaly"
        explanation = f"The anomaly baseline model flagged this transaction combining temporal pacing, monetary deviation, and underlying graph-structural shifts."
    else:
        fraud_type = "None"
        explanation = "Transaction exhibits standard baseline behavior."

    # Risk level thresholding based on final fused risk score
    if final_risk_score >= 0.8:
        risk_level = "Critical"
    elif final_risk_score >= 0.6:
        risk_level = "High"
    elif final_risk_score >= 0.4:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return fraud_type, explanation, risk_level

def predict_transaction(transaction_batch, model_path='fraud_model.pkl'):
    model, extractor = load_fraud_model_global(model_path)
    if model is None or extractor is None:
        raise ValueError("Model pipeline could not be loaded. Please train first.")

    feature_vectors = extractor.transform(transaction_batch)
    
    # Run model inference
    preds = model.predict(feature_vectors)
    scores = model.decision_function(feature_vectors)

    results = []
    
    for i in range(len(transaction_batch)):
        score = float(scores[i])
        
        # 1. Base Model Confidence
        model_confidence = float(1 / (1 + np.exp(score * 5)))

        # 2. Multi-Signal Risk Fusion
        final_risk_score = compute_multi_signal_risk_fusion(feature_vectors[i], model_confidence)
        
        # 3. Temporal Narrative & Mapping
        fraud_type, explanation, risk_level = map_fraud_and_explain(feature_vectors[i], final_risk_score)
        
        # 4. Bank Alert Priority System
        priority = get_alert_priority(risk_level, feature_vectors[i][0], feature_vectors[i][5])

        is_anomaly = (final_risk_score >= 0.5) or bool(preds[i] == -1)

        result = {
            "transaction_id": transaction_batch[i].get("id", f"txn_{i}"),
            "from": transaction_batch[i].get("from", "Unknown"),
            "to": transaction_batch[i].get("to", "Unknown"),
            "amount": float(transaction_batch[i].get("amount", 0)),
            "timestamp": transaction_batch[i].get("timestamp", 0),
            "anomaly": is_anomaly,
            "fused_risk_score": round(final_risk_score, 3),
            "model_confidence": round(model_confidence, 3),
        }

        if is_anomaly or fraud_type != "None":
            result["fraud_type"] = fraud_type
            result["risk_level"] = risk_level
            result["priority"] = priority
            result["explanation"] = explanation

        results.append(result)

    return results

if __name__ == "__main__":
    print("--- Example Prediction Evaluation ---")
    sample_batch = [
        {"id": "TXN_1", "from": "A123", "to": "B456", "amount": 50000, "timestamp": 1710000000},
        {"id": "TXN_2", "from": "77770001", "to": "77770002", "amount": 5000.00, "timestamp": 1710000010},
        {"id": "TXN_3", "from": "77770002", "to": "77770003", "amount": 5000.00, "timestamp": 1710000030},
        {"id": "TXN_4", "from": "88880001", "to": "88880002", "amount": 1200.00, "timestamp": 1710001000},
        {"id": "TXN_5", "from": "88880002", "to": "88880003", "amount": 1200.00, "timestamp": 1710001120},
        {"id": "TXN_6", "from": "88880003", "to": "88880001", "amount": 1200.00, "timestamp": 1710001240}
    ]

    try:
        predictions = predict_transaction(sample_batch)
        print(json.dumps(predictions, indent=2))
    except Exception as e:
        print(f"Could not run prediction example: {e}")
