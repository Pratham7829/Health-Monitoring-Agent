### 🧠 Health Monitoring AI Agent

A smart, explainable health monitoring system that analyzes patient vitals, detects trends, and provides risk assessment with confidence and reasoning — designed to simulate real-world AI agent behavior.

### 🚀 Overview

This project is a multi-patient health monitoring AI agent that:
Analyzes patient vitals (BP, Sugar, Heart Rate)
Tracks historical data per patient
Detects trends over time
Uses dataset-based reasoning
Computes risk with confidence score
Explains decisions using key factors
Visualizes patient health dynamically

👉 The goal is to move beyond simple rule-based systems and simulate a context-aware intelligent agent.

### 🎯 Key Features
🧠 1. Multi-Signal Risk Analysis
Combines: Current vitals, Patient history, Trend analysis, Dataset similarity

📈 2. Trend Detection
Analyzes patient’s past records to classify trend as: Increasing, Decreasing, Stable or Insufficient data

📊 3. Data Visualization
Interactive charts showing: Blood Pressure trend, Sugar levels, Heart Rate

🤖 4. Confidence Score
Instead of binary outputs, the system provides: “How confident is the prediction?”
Based on: Dataset support, Trend consistency, History size

🧩 5. Decision Factors (Explainability)
Instead of long logs, the system highlights key reasons: High Blood Pressure, Increasing Trend, Dataset Pattern Match

📦 6. Dataset-Aware Reasoning
Uses a dataset of past patients to: Compare similar cases, Adjust risk intelligently

🧑‍⚕️ 7. Multi-Patient Support
Each patient has: Unique ID, Separate history, Independent trend tracking

### ⚙️ Tech Stack

1. Frontend
HTML – Structure of the web pages
CSS – Styling and layout design
JavaScript – Client-side interactivity and logic
Chart.js – Used for data visualization (graphs, charts, analytics display)

2. Backend
Node.js – Server-side runtime for handling requests
Express.js – Framework for building APIs and managing routes

3. Data Handling
MongoDB Atlas – Cloud-based NoSQL database for storing user and project data
JSON dataset - We use a JSON dataset containing symptoms and risk. The backend matches user input with this dataset and calculates disease probability.

Updated by Chanchal Mathur