require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Global Exception Handlers to keep Gateway alive
process.on('uncaughtException', (err) => console.error('🔥 CRITICAL:', err.message));
process.on('unhandledRejection', (reason) => console.error('🔥 REJECTION:', reason));

// Environment credentials for the Python Fraud Detection Microservice
const FASTAPI_URL = process.env.FASTAPI_MICROSERVICE_URL || 'http://localhost:8000/predict';
const BASE64_TOKEN = process.env.BASE64_TOKEN;

// In-memory data store for the real-time dashboard
let latestResults = [];
let stats = {
    totalTransactions: 0,
    totalAmount: 0,
    flaggedCount: 0,
    activeCases: 0,
    avgRiskScore: 0
};

/**
 * Global POST Endpoint
 * Frontend (React/Next) or Kafka Streamer sends transactions here
 */
app.post('/api/monitor', async (req, res) => {
    try {
        const transactionsBatch = req.body;

        console.log(`[GATEWAY] Ingesting batch of ${transactionsBatch?.length || 0} transactions...`);

        if (!transactionsBatch || !Array.isArray(transactionsBatch)) {
            console.error("❌ Invalid payload received at /api/monitor");
            return res.status(400).json({ error: "Invalid payload. Node Gateway requires an Array of Transactions." });
        }

        if (transactionsBatch.length > 0) {
            console.log("[GATEWAY] Payload Sample:", JSON.stringify(transactionsBatch[0]));
        }

        console.log(`[GATEWAY] Bridging to AI Microservice: ${FASTAPI_URL}...`);

        // Bridge directly to the AI Module
        const pythonResponse = await axios.post(
            FASTAPI_URL,
            transactionsBatch,
            {
                headers: {
                    'Authorization': `Bearer ${BASE64_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10s timeout
            }
        );

        const newResults = pythonResponse.data.results;
        console.log(`[GATEWAY] AI Microservice Result: ${newResults?.length || 0} items processed.`);
        
        if (newResults && newResults.length > 0) {
            const sample = newResults[0];
            console.log(`[GATEWAY] Sample Node Metadata: ID:${sample.transaction_id}, Anomalous:${sample.anomaly}, Found Amount:${sample.amount}`);
        }

        // Update stats
        stats.totalTransactions += transactionsBatch.length;
        transactionsBatch.forEach(tx => {
            stats.totalAmount += (tx.amount || 0);
        });

        newResults.forEach(res => {
            if (res.anomaly) {
                stats.flaggedCount++;
                if (res.priority === 'CRITICAL') stats.activeCases++;
            }
        });

        // Store latest results (keep last 50)
        latestResults = [...newResults, ...latestResults].slice(0, 50);

        return res.json({
            success: true,
            intelligence: newResults
        });

    } catch (error) {
        console.error("❌ Python Microservice Exception:", error.message);
        if (error.response) {
            console.error("   └─ Microservice Error Body:", error.response.data);
        }
        res.status(500).json({ error: "FastAPI Engine is offline or out of reach." });
    }
});

/**
 * Endpoint for Dashboard Frontend to fetch latest intelligence
 */
app.get('/api/results', (req, res) => {
    res.json(latestResults);
});

/**
 * Endpoint for Dashboard Frontend to fetch KPI stats
 */
app.get('/api/stats', (req, res) => {
    // Inject some dynamic variance for the "live" feel
    const dynamicStats = {
        ...stats,
        totalTransactions: stats.totalTransactions,
        totalAmount: stats.totalAmount,
        avgRiskScore: stats.totalTransactions > 0 ? (stats.flaggedCount / stats.totalTransactions * 10).toFixed(1) : 0
    };
    res.json(dynamicStats);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n===============================================`);
    console.log(`🌐 Node.js Gateway Backend Listening: Port ${PORT}`);
    console.log(`🔒 Upstream Target: ${FASTAPI_URL}`);
    console.log(`===============================================\n`);
});
