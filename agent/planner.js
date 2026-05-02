function plan(patientData, patientRecords) {
  let steps = [];

  // Decision making for risk
  if (patientData.bp > 140 || patientData.sugar > 180) {
    steps.push("riskCalculator");
  }

  // Use correct history source
  if (patientRecords && patientRecords.length > 1) {
    steps.push("trendAnalyzer");
  }

  // Always include baseline tools
  steps.push("datasetAnalyzer");
  steps.push("recommender");

  return steps;
}

module.exports = { plan };