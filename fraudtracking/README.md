# 🖥️ Fraud Detection Dashboard

The frontend interface for the Fraud Detection Intelligence System. This dashboard allows financial analysts to monitor real-time transaction streams and investigate potential fraud through interactive visualizations.

## 🚀 Key Features
- **Real-Time KPI Tracking**: Immediate visibility into Total Risk Volume, Alert Frequency, and Model Confidence.
- **Live Alert Feed**: Categorized by severity (Critical, High, Medium, Low) and priority (P1–P4).
- **Transaction Relationship Graph**: Interactive visualization of fund movement to identify complex layering and smurfing patterns.
- **Explainable AI Integration**: Direct access to model-generated explanations for every anomaly.

## 🛠️ Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Visualization**: Custom SVG/Canvas for graph network analysis.

## 🏁 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Ensure your backend and ML microservice are running.

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

