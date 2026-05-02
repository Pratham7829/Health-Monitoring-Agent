require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const fs = require("fs/promises");

const agentController = require("./agent/controller");
const { loadDataset } = require("./agent/tools/datasetAnalyzer");
const connectDB = require("./db");

app.use(cors());
app.use(express.json());

// ---------------- ROUTES ----------------

app.get("/", (req, res) => {
    res.send("Health Agent Running");
});

app.get("/prompt", async (req, res) => {
    try {
        const prompt = await fs.readFile("./prompts/agentPrompt.txt", "utf-8");
        res.send(prompt);
    } catch (err) {
        console.error("Error reading prompt:", err);
        res.status(500).send("Error loading prompt");
    }
});

app.post("/analyze", async (req, res) => {
    try {
        const data = req.body;

        if (
            !data.patientId ||
            typeof data.bp !== "number" ||
            typeof data.sugar !== "number" ||
            typeof data.heartRate !== "number"
        ) {
            return res.status(400).json({ error: "Invalid input data" });
        }

        const result = await agentController(data);

        res.json(result);
    } catch (err) {
        console.error("Error in /analyze:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ---------------- SERVER START ----------------

async function startServer() {
    try {
        await connectDB();     // 🔥 MongoDB
        await loadDataset();   // 🔥 dataset

        app.listen(3000, () => {
            console.log("🚀 Server running on port 3000");
        });

    } catch (err) {
        console.error("❌ Failed to start server:", err);
    }
}

startServer();