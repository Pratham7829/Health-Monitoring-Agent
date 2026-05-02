async function submitForm() {
    const btn = document.getElementById("analyzeBtn");
    btn.disabled = true;

    document.getElementById("loading").style.display = "block";
    document.getElementById("result").innerHTML = "";

    const patientId = document.getElementById("patientId").value;
    const bp = Number(document.getElementById("bp").value);
    const sugar = Number(document.getElementById("sugar").value);
    const heartRate = Number(document.getElementById("heartRate").value);

    // Validation
    if (!patientId || isNaN(bp) || isNaN(sugar) || isNaN(heartRate)) {
        document.getElementById("result").innerHTML =
            `<p style="color:red;">Please fill all fields.</p>`;
        btn.disabled = false;
        document.getElementById("loading").style.display = "none";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ patientId, bp, sugar, heartRate })
        });
        if (!response.ok) {
            throw new Error("API Error");
        }
        const data = await response.json();

        // 🔥 GRAPH FIRST (IMPORTANT FIX)
        document.getElementById("result").innerHTML = `

            <div class="card full-width">
                <h4>📊 Health Trends</h4>
                <canvas id="bpChart" height="120"></canvas>
            </div>

            <div class="card">
                <h4>Risk</h4>
                <span class="risk-badge ${data.risk}">
                    ${data.risk.toUpperCase()}
                </span>
                <p><strong>Initial:</strong> ${data.initialRisk}</p>
            </div>

             <!-- 🧠 CONFIDENCE -->
            <div class="card">
                <h4>Confidence</h4>
                <p style="
                    font-size:18px;
                    font-weight:600;
                    color:${data.confidence > 75 ? "#2ecc71" : data.confidence > 50 ? "#f39c12" : "#e74c3c"};
                ">
                    ${data.confidence}%
                </p>
            </div>

            <div class="card">
                <h4>📈 Trend</h4>
                <p>${data.trend}</p>
            </div>

            <!-- 🧠 DECISION FACTORS -->
            <div class="card">
                <h4>Decision Factors</h4>
                <ul>
                    ${(data.factors || []).map(f => `<li>✔ ${f}</li>`).join("")}
                </ul>
            </div>

            <div class="card">
                <h4>Recommendation</h4>
                <p>${data.recommendation}</p>
            </div>

            <div class="card">
                <h4>📊 Dataset Insight</h4>
                <p>High: ${data.datasetResult.high}</p>
                <p>Medium: ${data.datasetResult.medium}</p>
                <p>Low: ${data.datasetResult.low}</p>
            </div>

            <div class="card full-width">
                <h4 onclick="toggleReasoning()" class="clickable" id="reasoningTitle">
                    Reasoning ⬇
                </h4>
                <ul id="reasoningList" style="display:none;">
                    ${data.reasoning.map(r => `<li>${r}</li>`).join("")}
                </ul>
            </div>
        `;

        // 🔥 CHART LOGIC
        const history = data.patientHistory;

        if (history && history.length > 0) {

            const labels = history.map((_, i) => `T${i + 1}`);
            const bpValues = history.map(r => r.bp);
            const sugarValues = history.map(r => r.sugar);
            const heartValues = history.map(r => r.heartRate);

            const ctx = document.getElementById("bpChart").getContext("2d");

            // 🔥 Gradient backgrounds
            const gradientBP = ctx.createLinearGradient(0, 0, 0, 200);
            gradientBP.addColorStop(0, "rgba(231, 76, 60, 0.4)");
            gradientBP.addColorStop(1, "rgba(231, 76, 60, 0)");

            const gradientSugar = ctx.createLinearGradient(0, 0, 0, 200);
            gradientSugar.addColorStop(0, "rgba(243, 156, 18, 0.4)");
            gradientSugar.addColorStop(1, "rgba(243, 156, 18, 0)");

            const gradientHeart = ctx.createLinearGradient(0, 0, 0, 200);
            gradientHeart.addColorStop(0, "rgba(52, 152, 219, 0.4)");
            gradientHeart.addColorStop(1, "rgba(52, 152, 219, 0)");

            if (window.bpChartInstance) {
                window.bpChartInstance.destroy();
            }

            window.bpChartInstance = new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "BP",
                            data: bpValues,
                            borderColor: "#e74c3c",
                            backgroundColor: gradientBP,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4
                        },
                        {
                            label: "Sugar",
                            data: sugarValues,
                            borderColor: "#f39c12",
                            backgroundColor: gradientSugar,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4
                        },
                        {
                            label: "Heart Rate",
                            data: heartValues,
                            borderColor: "#3498db",
                            backgroundColor: gradientHeart,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    interaction: {
                        mode: "index",
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            position: "top"
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: "#333"
                        },
                        title: {   // optional
                            display: true,
                            text: "Patient Health Trends"
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            grid: {
                                color: "#eee"
                            }
                        }
                    }
                }
            });
        }

    } catch (error) {
        console.error(error);
        document.getElementById("result").innerHTML =
            `<p style="color:red;">Something went wrong. Please try again.</p>`;
    }

    btn.disabled = false;
    document.getElementById("loading").style.display = "none";
}

// 🔥 Toggle reasoning (with arrow change)
function toggleReasoning() {
    const list = document.getElementById("reasoningList");
    const title = document.getElementById("reasoningTitle");

    if (list.style.display === "none") {
        list.style.display = "block";
        title.innerHTML = "Reasoning ⬆";
    } else {
        list.style.display = "none";
        title.innerHTML = "Reasoning ⬇";
    }
}


// 🔥 Show / Hide Agent Prompt (popup)
async function togglePrompt() {
    const box = document.getElementById("promptBox");

    if (box.style.display === "none") {
        const res = await fetch("http://localhost:3000/prompt");
        const text = await res.text();

        box.innerText = text;
        box.style.display = "block";
    } else {
        box.style.display = "none";
    }
}