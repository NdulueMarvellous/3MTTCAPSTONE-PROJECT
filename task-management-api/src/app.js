require('dotenv').config

const PORT = process.env.PORT || 3000; // Fallback to 3000 if undefined
const DB_URI = process.env.DB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!DB_URI || !JWT_SECRET) {
    console.error("DB_URI or JWT_SECRET is not defined in the .env file.");
    process.exit(1);
}

console.log("Server Configurations:");
console.log("PORT:", PORT);
console.log("DB_URI:", DB_URI);
console.log("JWT_SECRET:", JWT_SECRET);

const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./utils/mongo");
const authRoutes = require("./routes/authRoutes"); // Authentication routes (login & register)
const taskRoutes = require("./routes/taskRoutes"); // Task routes
const cors = require('cors');
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header

    if (!token) {
        return res.status(403).json({ error: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        req.user = decoded; // Store decoded info in req.user
        next(); // Move to the next middleware or route handler
    });
};

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Authentication Routes
app.use("/auth", authRoutes); // Routes for registration and login

// Protected Routes
app.use("/tasks", verifyToken, taskRoutes); // Protect task routes with JWT middleware

// Root Route Handler (for testing or landing page)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Connect to MongoDB
console.log('Connecting to database...');
connectDB();

// Export the app instance for testing
module.exports = app;

// Server startup handled in a separate file
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}
