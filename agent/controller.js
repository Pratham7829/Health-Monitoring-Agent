const trendAnalyzer = require("./tools/trendAnalyzer");
const riskCalculator = require("./tools/riskCalculator");
const recommender = require("./tools/recommender");
const { datasetAnalyzer } = require("./tools/datasetAnalyzer");

// 🔥 MongoDB model
const Patient = require("../models/Patient");

// 🔥 async fs (only for prompt now)
const fs = require("fs/promises");

// -------------------- PROMPT LOADER --------------------

async function loadPrompt() {
    try {
        return await fs.readFile("./prompts/agentPrompt.txt", "utf-8");
    } catch (err) {
        console.error("Error loading prompt:", err);
        return "";
    }
}

// -------------------- MAIN CONTROLLER --------------------

async function agentController(data) {
    console.log("api hit");

    let reasoning = [];

    // 🔥 find patient in DB
    let patient = await Patient.findOne({ patientId: data.patientId });

    // create if not exists
    if (!patient) {
        patient = new Patient({
            patientId: data.patientId,
            records: []
        });
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

    // 🔥 save to DB
    await patient.save();
    console.log("Saved patient:", patient);

    // Step 1
    reasoning.push("Goal: Analyze patient health and detect risk");

    // Step 2: Trend
    const trend = trendAnalyzer(patient.records);
    reasoning.push(`Trend Analysis for Patient ${data.patientId}: ${trend}`);
    reasoning.push(`Records used for trend: ${patient.records.length}`);

    // Step 3: Dataset
    reasoning.push("Decision: Using dataset analysis tool");
    const datasetResult = datasetAnalyzer(data);

    reasoning.push(
        `Dataset Insight → High: ${datasetResult.high}, Medium: ${datasetResult.medium}, Low: ${datasetResult.low}`
    );

    // Step 4: Prompt
    const prompt = await loadPrompt();
    reasoning.push("Loaded Agent Instructions");

    let strictMode = prompt.includes("strict");
    reasoning.push(`Mode: ${strictMode ? "Strict" : "Normal"}`);

    // Step 5: Base Risk
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

    let risk = initialRisk;
    let factors = [];

    if (data.bp > 140) factors.push("High Blood Pressure");
    if (data.sugar > 180) factors.push("High Sugar Level");
    if (trend === "increasing") factors.push("Increasing Health Risk Trend");
    if (datasetResult.high > 0.6) factors.push("Matches High-Risk Patient Patterns");

    if (factors.length === 0) {
        factors.push("All vitals within safe range");
    }

    // Step 6: Dataset Adjustment
    const highProb = datasetResult.high;
    const mediumProb = datasetResult.medium;

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

    // Step 7: Confidence
    let confidence = 0;

    if (risk === "high") confidence += datasetResult.high * 60;
    else if (risk === "medium") confidence += datasetResult.medium * 60;
    else confidence += datasetResult.low * 60;

    if (trend === "increasing") confidence += 15;
    if (trend === "stable") confidence += 8;

    confidence += Math.min(patient.records.length * 5, 25);

    confidence = Math.min(100, Math.round(confidence));

    // Step 8: Recommendation
    const recommendation = recommender(risk);
    reasoning.push(`Decision: ${recommendation}`);

    return {
        trend,
        initialRisk,
        risk,
        recommendation,
        reasoning,
        datasetResult,
        patientHistory: patient.records,
        confidence,
        factors
    };
}

module.exports = agentController;