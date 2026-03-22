# Fraud Detection Intelligence Module - Context & Integration Guide

## 🎯 System Identity
*"A real-time financial intelligence system that combines behavioral analytics, graph-based fund tracking, and anomaly detection to detect and explain fraud patterns."*

---

## 📥 1. Input Specifications (Backend/API Request Format)
The module accepts live transactional data via Python dictionaries (which map 1:1 to JSON). It supports both **Single Execution** and **Batch Processing**.

**Expected JSON Schema / Payload:**
```json
[
  {
    "id": "TXN_9912",
    "from": "A123",
    "to": "B456",
    "amount": 50000.00,
    "timestamp": 1710000000
  }
]
```
*(Note: `id` is required for tracing responses. `timestamp` must be a standard UNIX epoch format integer. `from` and `to` are string/integer representations of the entities).*

---

## 🧠 2. Feature Engineering Dictionary (The 12-Dimensional Space)
The ML `FeatureExtractor` maintains an active sliding memory state (24-hour limit & 100,000 edge memory bound ceiling) and computes the following 12 features on-the-fly:

### A. Basic Features
1. **`amount`**: Raw transactional monetary volume.
2. **`time_gap`**: Seconds elapsed since the sender's last previous transaction.
3. **`tx_freq`**: Total frequency of the sender's transactions inside the current rolling time window.

### B. Behavioral Features
4. **`amount_deviation`**: Absolute monetary deviation from the user's historical baseline average behavior.
5. **`unusual_timing`**: Binary flag (1/0) triggering if the transaction occurs outside normal jurisdictional hours (e.g., 11 PM - 5 AM).

### C. Graph-Based Features (NetworkX Structural Analysis)
6. **`tx_velocity`**: Total weighted outward volume (money velocity) moving through the sender's active sub-graph.
7. **`hop_count`**: Bounded Breadth-First-Search (BFS) depth of cyclic connections (Shortest path back to origin).
8. **`cycle_detected`**: Binary flag (1/0) if a cyclic structural loop (A -> B -> C -> A) is definitively breached.
9. **`unique_connected`**: Overall active degree score (In + Out) calculating general structural density around the account.

### D. Sequence Context Awareness
10. **`recent_3_amount_total`**: The combined monetary volume of the previous 3 immediate transactions by the same entity.
11. **`recent_3_avg_time_gap`**: The average pacing (gap length) of the entire micro-sequence.
12. **`unique_receivers`**: Exact number of independent targets the sender has routed to recently (Out Degree).

---

## 📤 3. Output Specifications (Frontend/Dashboard Final Response)
The return object merges the Isolation Forest Machine Learning core probabilities with rule-based heuristics to provide fully contextualised banking intelligence outputs. 

**Standard Output Schema:**
```json
[
  {
    "transaction_id": "TXN_9912",
    "anomaly": true,
    "fused_risk_score": 0.841,
    "model_confidence": 0.902,
    "fraud_type": "Layering",
    "risk_level": "Critical",
    "priority": "P1",
    "explanation": "Within a 4 minute span, funds roughly totaling $3,600.00 moved across 3 linked accounts forming a structural cyclic loop, indicating immediate layering."
  }
]
```
*(Note: If `anomaly` is false, it returns a stripped-down basic clearance object without Priority/Fraud Type metadata, saving payload bandwidth & computing).*

---

## ⚖️ 4. Intelligence Mappings & Scoring Logic

### A. Multi-Signal Risk Fusion Algorithm
To establish robust business decisions, risk heavily utilizes the `fused_risk_score` utilizing combined matrix weights:
* **`0.50`** - Isolation Forest Isolation Metric (`model_confidence` derived by Sigmoid translation from raw scoring map - `1 / (1 + e^Z)`)
* **`0.30`** - Behavioral Irregularity Score (Derived via volume deviations + velocity thresholds)
* **`0.20`** - Graph & Network Topology Score (Derived via unique targets and cyclic loops)

### B. Risk Levels
Determines color coding or urgency visual markers on frontend dashboard:
* 🚨 **Critical** : `>= 0.80 Fused Score`
* 🟠 **High** : `>= 0.60 Fused Score`
* 🟡 **Medium** : `>= 0.40 Fused Score`
* 🟢 **Low** : `< 0.40 Fused Score`

### C. Alert Priority Escalation 
Determines the bucket lists and ticket severities assigned to physical bank analysts:
* **P1**: Overall System-wide Critical, OR (High Risk + >$10k Transacting), OR (> $50k overall Sub-graph Velocity).
* **P2**: High Risk defaults, OR (Medium Risk + >$5k Transacting).
* **P3**: Medium Risk anomalies.
* **P4**: Mild statistical deviations and general flags.

### D. Fraud Typologies Detected
1. **Layering**: Triggers definitively upon cycle confirmations (Structural wash loops tracking back to sender).
2. **Smurfing / Structuring**: Triggers rapidly on transaction bursts constrained locally within extremely short time windows (Sequence tracking).
3. **Account Takeover / Disbursement**: Flagged via high-velocity mass fan-out patterns across multiple independent recipients simultaneously.
4. **Suspicious Behavior**: Abnormal statistical deviation from established personal baseline monetary benchmarks.
5. **General Anomaly**: Multidimensional Machine Learning outliers that diverge completely from standard behavior topologies, catching things strict heuristic rules miss entirely.
