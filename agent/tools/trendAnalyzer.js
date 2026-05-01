function trendAnalyzer(records) {

    if (records.length < 2) {
        return "insufficient data";
    }

    let increasing = 0;
    let decreasing = 0;

    for (let i = 1; i < records.length; i++) {
        if (records[i].bp > records[i - 1].bp) {
            increasing++;
        } else if (records[i].bp < records[i - 1].bp) {
            decreasing++;
        }
    }

    if (increasing > decreasing) return "increasing";
    if (decreasing > increasing) return "decreasing";
    return "stable";
}

module.exports = trendAnalyzer;