const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const app = express();
app.use(express.json());

// ✅ Default route to check if server is running
app.get("/", (req, res) => {
    res.send("✅ Server is up and running!");
});

// ✅ MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/retail_pulse")
    .then(() => console.log("✅ MongoDB connected successfully!"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Job Schema (Fixed `errors` field)
const jobSchema = new mongoose.Schema({
    job_id: String,
    visits: Array,
    status: { type: String, default: "ongoing" },
    results: Array,
    error_logs: Array // Renamed from 'errors' to avoid conflicts
});
const Job = mongoose.model("Job", jobSchema);

// ✅ Submit Job API
app.post("/api/submit/", async (req, res) => {
    console.log("✅ Received request:", JSON.stringify(req.body, null, 2)); // Debug request body

    const { count, visits } = req.body;

    // Debug logs
    if (!count || !Array.isArray(visits)) {
        console.log("❌ Invalid request: Missing 'count' or 'visits'");
        return res.status(400).json({ error: "Missing 'count' or 'visits' field" });
    }

    if (count !== visits.length) {
        console.log("❌ Invalid request: 'count' does not match number of visits");
        return res.status(400).json({ error: "'count' does not match number of visits" });
    }

    const job_id = uuidv4();
    const newJob = new Job({ job_id, visits, status: "ongoing", results: [], error_logs: [] });
    await newJob.save();

    processImages(job_id, visits);

    res.status(201).json({ job_id });
});


// ✅ Function to Process Images (Fixed Axios Image Fetch)
const processImages = async (job_id, visits) => {
    const job = await Job.findOne({ job_id });
    if (!job) return;

    let results = [];
    let error_logs = [];

    for (const visit of visits) {
        const { store_id, image_url } = visit;

        for (const url of image_url) {
            try {
                // ✅ Use responseType "arraybuffer" to properly fetch image
                const response = await axios.get(url, { responseType: "arraybuffer" });
                if (response.status !== 200) throw new Error("Image download failed");

                // ✅ Generate Random Height & Width
                const height = Math.floor(Math.random() * 500) + 100;
                const width = Math.floor(Math.random() * 500) + 100;
                const perimeter = 2 * (height + width);

                // ✅ Simulate GPU Processing Time (0.1 to 0.4 sec)
                const delay = Math.random() * (400 - 100) + 100;
                await sleep(delay);

                results.push({ store_id, image_url: url, perimeter });

            } catch (error) {
                error_logs.push({ store_id, error: error.message });
            }
        }
    }

    // ✅ Update Job Status
    await Job.updateOne({ job_id }, {
        status: error_logs.length > 0 ? "failed" : "completed",
        results,
        error_logs
    });
};

// ✅ Get Job Info API
app.get("/api/status", async (req, res) => {
    const { jobid } = req.query;

    if (!jobid) return res.status(400).json({ error: "Job ID required" });

    const job = await Job.findOne({ job_id: jobid });
    if (!job) return res.status(400).json({ error: "Job not found" });

    res.status(200).json({
        status: job.status,
        job_id: job.job_id,
        results: job.results,
        error_logs: job.error_logs
    });
});

// ✅ Start Server
app.listen(3000, () => console.log("✅ Server running on port 3000"));
