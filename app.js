const express = require("express");
const app = express();
const cors = require("cors");

// 🔥 use async fs
const fs = require("fs/promises");

// 🔥 import controller
const agentController = require("./agent/controller");

// 🔥 import dataset loader
const { loadDataset } = require("./agent/tools/datasetAnalyzer");

app.use(cors());
app.use(express.json());

// ---------------- ROUTES ----------------

app.get("/", (req, res) => {
    res.send("Health Agent Running");
});

// 🔥 async prompt route
app.get("/prompt", async (req, res) => {
    try {
        const prompt = await fs.readFile("./prompts/agentPrompt.txt", "utf-8");
        res.send(prompt);
    } catch (err) {
        console.error("Error reading prompt:", err);
        res.status(500).send("Error loading prompt");
    }
});

// 🔥 async controller route
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
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ---------------- SERVER START ----------------

// 🔥 load dataset BEFORE server starts
async function startServer() {
    try {
        await loadDataset(); // ✅ important

        app.listen(3000, () => {
            console.log("🚀 Server running on port 3000");
        });

    } catch (err) {
        console.error("❌ Failed to start server:", err);
    }
}

startServer();