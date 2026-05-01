function recommender(risk) {
    if (risk === "high") return "Consult a doctor immediately";
    if (risk === "medium") return "Monitor and improve lifestyle";
    return "All good, maintain routine";
}

module.exports = recommender;