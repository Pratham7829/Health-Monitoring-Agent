function riskCalculator(data, trend) {
    
    if (data.bp > 140 || data.sugar > 180) return "high";
    if (trend === "increasing") return "medium";
    return "low";
}

module.exports = riskCalculator;