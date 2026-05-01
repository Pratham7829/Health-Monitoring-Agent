const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Health Agent Running");
});

app.get("/prompt", (req, res) => {
    const prompt = fs.readFileSync("./prompts/agentPrompt.txt", "utf-8");
    res.send(prompt);
});

const agentController = require("./agent/controller");

app.post("/analyze", (req, res) => {
    const data = req.body;

    const result = agentController(data);

    res.json(result);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});