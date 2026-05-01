const trendAnalyzer = require("./tools/trendAnalyzer");
const riskCalculator = require("./tools/riskCalculator");
const recommender = require("./tools/recommender");
const fs = require("fs");
const datasetAnalyzer = require("./tools/datasetAnalyzer");

function loadPrompt() {
    return fs.readFileSync("./prompts/agentPrompt.txt", "utf-8");
}

function loadHistory() {
    const data = fs.readFileSync("./data/history.json", "utf-8");
    return JSON.parse(data);
}

function saveHistory(history) {
    fs.writeFileSync("./data/history.json", JSON.stringify(history, null, 2));
}

function agentController(data) {

    let reasoning = [];

    let historyData = loadHistory();
    // let history = loadHistory();

    // find patient
    let patient = historyData.find(p => p.patientId === data.patientId);

    // if patient not found → create new
    if (!patient) {
        patient = {
            patientId: data.patientId,
            records: []
        };
        historyData.push(patient);
    }

    // add new record
    patient.records.push({
        bp: data.bp,
        sugar: data.sugar,
        heartRate: data.heartRate
    });

    // keep last 5 records
    if (patient.records.length > 5) {
        patient.records.shift();
    }

    // save updated history
    saveHistory(historyData);

    // Step 1: Understand goal
    reasoning.push("Goal: Analyze patient health and detect risk");

    // // Step 2: Analyze trend( use ONLY this patient’s history)
    const trend = trendAnalyzer(patient.records);
    reasoning.push(`Trend Analysis for Patient ${data.patientId}: ${trend}`);
    reasoning.push(`Records used for trend: ${patient.records.length}`);

    // Step 3: Dataset Analysis (placed correctly)
    reasoning.push("Decision: Using dataset analysis tool");
    const datasetResult = datasetAnalyzer(data);

    reasoning.push(
        `Dataset Insight → High: ${datasetResult.high}, Medium: ${datasetResult.medium}, Low: ${datasetResult.low}`
    );

    // Step 4: Load prompt
    const prompt = loadPrompt();
    reasoning.push("Loaded Agent Instructions");

    let strictMode = prompt.includes("strict");
    reasoning.push(`Mode: ${strictMode ? "Strict" : "Normal"}`);

    // Step 5: Calculate base risk
    let initialRisk;

    if (strictMode) {
        reasoning.push("Strict mode detected → applying stricter thresholds");

        if (data.bp > 130 || data.sugar > 160) {
            initialRisk = "high";
        } else if (trend === "increasing") {
            initialRisk = "medium";
        } else {
            initialRisk = "low";
        }

    } else {
        reasoning.push("Normal mode → using standard risk calculator");
        initialRisk = riskCalculator(data, trend);
    }

    reasoning.push(`Initial Risk (rules + trend): ${initialRisk}`);

    // final risk starts from initial
    let risk = initialRisk;

        let factors = [];

    if (data.bp > 140) factors.push("High Blood Pressure");
    if (data.sugar > 180) factors.push("High Sugar Level");
    if (trend === "increasing") factors.push("Increasing Health Risk Trend");
    if (datasetResult.high > 0.6) factors.push("Matches High-Risk Patient Patterns");

    if (factors.length === 0) {
        factors.push("All vitals within safe range");
    }

    // Step 6: Adjust using dataset

    // convert to numbers (fix issue)
    const highProb = parseFloat(datasetResult.high);
    const mediumProb = parseFloat(datasetResult.medium);

    // adjustment logic
    if (highProb === 0 && mediumProb === 0) {
        reasoning.push("No similar dataset records found → relying on rules and trend only");
    }
    else if (highProb > 0.6) {
        reasoning.push(`Dataset high risk probability = ${highProb} → upgrading to HIGH`);
        risk = "high";
    } 
    else if (mediumProb > 0.5 && risk === "low") {
        reasoning.push(`Dataset medium risk probability = ${mediumProb} → upgrading to MEDIUM`);
        risk = "medium";
    }

    reasoning.push(`Final Risk (after dataset analysis): ${risk}`);

    let confidence = 0;

    // 1) dataset signal (strongest)
    if (risk === "high") confidence += datasetResult.high * 60;
    else if (risk === "medium") confidence += datasetResult.medium * 60;
    else confidence += datasetResult.low * 60;

    // 2) trend signal
    if (trend === "increasing") confidence += 15;
    if (trend === "stable") confidence += 8;

    // 3) history signal (more data → more confidence)
    confidence += Math.min(historyData.length * 5, 25);

    // clamp 0–100
    confidence = Math.min(100, Math.round(confidence));

    // Step 7: Recommendation
    const recommendation = recommender(risk);
    reasoning.push(`Decision: ${recommendation}`);

    return {
        trend,
        initialRisk,
        risk,
        recommendation,
        reasoning,
        datasetResult,
        patientHistory: patient.records,   // 🔥 ADD THIS
        confidence,
        factors
    };
}

module.exports = agentController;