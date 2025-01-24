import cors from "cors";
import express from "express";
import fs from "fs";

// Set up the server
const PORT = process.env.PORT || 4000;
const app = express();

// Allow CORS for all origins
app.use(cors());
// Parse JSON bodies
app.use(express.json());

// Path to the log file
const LOG_PATH = "events.log";

// POST /analytics endpoint to receive events
app.post("/analytics", (req, res) => {
  // Extract the event data from the request body
  const eventData = req.body;

  // Get the IP address of the client
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  // If the IP address is a comma-separated list, use the first IP address
  if (typeof ip === "string" && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }

  // Combine the event data with the IP address
  const event = {
    ...eventData,
    ip: ip || "Unknown IP",
  };

  // Log in console
  console.log("Received analytics event:", event);

  // Write to file
  const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(event)}\n`;
  fs.appendFileSync(LOG_PATH, logEntry);

  // Respond to the client
  res.status(200).json({ status: "ok" });
});

// Show the log file on /analytics
app.get("/analytics", (req, res) => {
  const logFile = fs.readFileSync(LOG_PATH, "utf8");
  const logLines = logFile.split("\n");
  const logHtml = logLines.join("<br>");
  res.send(`
    <html>
      <body>
        <a href="/analytics/download">Download log file</a>
        <pre>${logHtml}</pre>
      </body>
    </html>
  `);
});

// Download the log file on /analytics/download
app.get("/analytics/download", (req, res) => {
  // Download the log file
  res.download(LOG_PATH);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Analytics service listening on port ${PORT}`);
});
