const fs = require("fs");

function loadDataset() {
    const data = fs.readFileSync("./data/dataset.json", "utf-8");
    return JSON.parse(data);
}

function datasetAnalyzer(input) {
    const dataset = loadDataset();

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
        high: (count.high / total).toFixed(2),
        medium: (count.medium / total).toFixed(2),
        low: (count.low / total).toFixed(2)
    };
}

module.exports = datasetAnalyzer;