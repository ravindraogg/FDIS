# Fraud Detection Intelligence System (FDIS)

**A Real-Time, Multi-Tiered Financial Intelligence & Anomaly Detection Platform**  
*Harnessing Machine Learning, Graph Topology, and Behavioral Analytics to secure modern banking.*

---

## Table of Contents
1. [Project Overview](#-project-overview)
2. [Detailed Architecture](#-detailed-architecture)
   - [AI Intelligence Microservice (Python/FastAPI)](#1-ai-intelligence-microservice-pythonfastapi)
   - [Node.js Gateway API (Backend)](#2-nodejs-gateway-api-backend)
   - [Real-Time Data Streamer (Kafka Simulation)](#3-real-time-data-streamer-kafka-simulation)
   - [Analyst Dashboard (Next.js Frontend)](#4-analyst-dashboard-nextjs-frontend)
3. [Deep Intelligence: The 12-Dimensional Feature Space](#-deep-intelligence-the-12-dimensional-feature-space)
4. [Risk Fusion & Explainability Logic](#-risk-fusion--explainability-logic)
5. [Fraud Typologies Detected](#-fraud-typologies-detected)
6. [Getting Started (Deployment Guide)](#-getting-started-deployment-guide)

---

## Project Overview

FDIS is a production-ready conceptual framework for real-time fraud monitoring. Unlike traditional rule-based systems that look for simple triggers (e.g., "amount > $10k"), FDIS analyzes the **relationships** between entities, the **temporal pacing** of transactions, and **multi-dimensional deviations** from historical behavior.

The system is designed to be highly modular, allowing the AI engine, the data source, and the user interface to scale independently.

---

## Detailed Architecture

### 1. AI Intelligence Microservice (`/model`)
The core processing engine that transforms raw transaction data into actionable intelligence.
- **Engine**: FastAPI + Uvicorn for high-concurrency asynchronous processing.
- **Machine Learning**: Utilizes an **Isolation Forest** ensemble model trained on 500k+ transactions. It doesn't just look for "bad" patterns; it identifies anything that doesn't look "normal."
- **Feature Extractor**: A custom `FeatureExtractor` class that maintains a rolling 24-hour memory of transaction flows. It computes graph-based metrics (NetworkX) and behavioral deviations on-the-fly.
- **Security**: Enforces Base64 Token authentication for all incoming prediction requests.

### 2. Node.js Gateway API (`/backend`)
Acts as the "Central nervous system" and security perimeter.
- **Bridge Pattern**: Decouples the frontend from the complex AI microservice.
- **State Management**: Maintains in-memory KPI statistics (Total Volume, Flagged counts, Active Cases) and a rolling buffer of the latest 50 intelligence reports.
- **Endpoint Design**:
  - `POST /api/monitor`: The ingestion point for streaming data.
  - `GET /api/results`: Provides the dashboard with the most recent fraud alerts.
  - `GET /api/stats`: Serves real-time performance and risk metrics.

### 3. Real-Time Data Streamer (`/dataStreaming`)
A robust simulation of a high-load Kafka event stream.
- **Operation**: Ingests a massive 500k-row historical dataset and replays it at high velocity.
- **Pacing**: Streams batches of transactions every second to simulate a realistic production environment.
- **Feedback Loop**: Logs the detection outcomes (Alert vs Clear) directly to `streaming_fraud_logs.txt` with sub-second timestamps.

### 4. Analyst Dashboard (`/fraudtracking`)
A high-fidelity interface built for security analysts.
- **Next.js 15+**: Leveraging Server Components and optimized client-side hydration.
- **Real-Time Hydration**: Polls the Node.js gateway to provide a "live" heartbeat of the system.
- **Graph Visualization**: Uses SVG-based node-link diagrams to visualize the paths funds take through the system, highlighting cyclic loops (Money Laundering) in red.

---

## Deep Intelligence: The 12-Dimensional Feature Space

Our `FeatureExtractor` maps every transaction into a high-dimensional vector space:

| Feature Name | Category | Description |
| :--- | :--- | :--- |
| `amount` | Basic | The raw monetary value of the transaction. |
| `time_gap` | Basic | Seconds since the sender's last activity. |
| `tx_freq` | Basic | Number of transactions by the sender in the current window. |
| `amount_deviation` | Behavioral | Absolute distance from the sender's historical average. |
| `unusual_timing` | Behavioral | Flag for transactions occurring outside normal business hours. |
| `tx_velocity` | Graph | Total outgoing volume from the sender's sub-graph. |
| `hop_count` | Graph | BFS depth of the transaction path. |
| `cycle_detected` | Graph | **CRITICAL**: Identifies if funds return to the origin entity. |
| `unique_connected` | Graph | Number of direct relationships the sender maintains. |
| `recent_3_total` | Sequence | Combined volume of the last 3 transactions. |
| `recent_3_avg_gap` | Sequence | Average pacing of the current transaction burst. |
| `unique_receivers` | Sequence | Count of independent targets in the current window. |

---

## Risk Fusion & Explainability Logic

FDIS utilizes a **Multi-Signal Risk Fusion (MSRF)** algorithm to reduce false positives:
- **0.50 Weight**: Isolation Forest Anomaly Score (Sigmoid translated).
- **0.30 Weight**: Behavioral Scoring (Deviation + Timing + Pacing).
- **0.20 Weight**: Graph Topology (Cycle detection + Network Density).

**The Narrative Layer**: Every prediction is passed through a "Narrative Engine" that converts math into English:
> *"Example: Within a 4 minute span, funds roughly totaling $3,600.00 moved across 3 linked accounts forming a structural cyclic loop, indicating immediate layering."*

---

## Fraud Typologies Detected

1. **Layering (Money Laundering)**: Triggered strictly by cyclic structural loops in the transaction graph.
2. **Smurfing / Structuring**: Identified by high-frequency transaction bursts (>= 3 txns) within short time-spans (< 5 mins).
3. **Account Takeover / Disbursement**: Detected when a single sender suddenly routes funds to 5+ unique recipients simultaneously with high volume.
4. **General Anomaly**: Detected by the ML model as a multidimensional outlier that doesn't fit any known heuristic rule.

---

## Getting Started (Deployment Guide)

### Prerequisites
- **Python 3.10+**
- **Node.js 20+**
- **npm / pip**

### Launch Sequence (Run in separate terminals)

**Step 1: AI Engine**
```bash
cd model
pip install -r requirements.txt
python main.py
```
*Wait for: Microservice Booting on Port 8000*

**Step 2: Gateway Backend**
```bash
cd backend
npm install
npm start
```
*Wait for: Node.js Gateway Backend Listening: Port 5000*

**Step 3: Streaming Data**
```bash
cd dataStreaming
python kafka_streamer.py
```
*You will see: [FRAUD ALERT] logs appearing as it detects anomalies.*

**Step 4: Frontend Dashboard**
```bash
cd fraudtracking
npm install
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000) to view the live dashboard.*

---
*Created for the 2026 IdeaHackathon - Focused on building safer financial ecosystems.*
