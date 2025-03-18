const express = require("express");
const db = require("./database");
const userRoutes = require("./routes/users"); // Importing user routes

const app = express();
app.use(express.json());

// Use the user routes
app.use("/api", userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
