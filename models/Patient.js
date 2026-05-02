const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    bp: Number,
    sugar: Number,
    heartRate: Number
});

const patientSchema = new mongoose.Schema({
    patientId: String,
    records: [recordSchema]
});

module.exports = mongoose.model("Patient", patientSchema);