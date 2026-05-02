const fs = require("fs/promises");

// 🔥 global dataset cache
let dataset = [];

// 🔥 load once
async function loadDataset() {
    try {
        const data = await fs.readFile("./data/dataset.json", "utf-8");
        dataset = JSON.parse(data);
        console.log("✅ Dataset loaded successfully");
    } catch (err) {
        console.error("❌ Error loading dataset:", err);
        dataset = [];
    }
}

// 🔥 analyzer (no file read here now)
function datasetAnalyzer(input) {

    let similar = [];

    dataset.forEach(record => {
        if (
            Math.abs(record.bp - input.bp) <= 10 &&
            Math.abs(record.sugar - input.sugar) <= 20 &&
            Math.abs(record.heartRate - input.heartRate) <= 15
        ) {
            similar.push(record);
        }
    });

    if (similar.length === 0) {
        return { high: 0, medium: 0, low: 0 };
    }

    let count = { high: 0, medium: 0, low: 0 };

    similar.forEach(r => {
        count[r.risk]++;
    });

    const total = similar.length;

    return {
        high: Math.round((count.high / total) * 100) / 100,
        medium: Math.round((count.medium / total) * 100) / 100,
        low: Math.round((count.low / total) * 100) / 100
    };
}

module.exports = {
    datasetAnalyzer,
    loadDataset
};