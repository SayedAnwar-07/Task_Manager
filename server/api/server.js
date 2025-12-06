const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("../config/connectDB");
const { notFound, errorHandler } = require("../middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: ["*"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "Task Manager API is running on Vercel" });
});

// Routes
app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/users", require("../routes/userRoutes"));
app.use("/api/tasks", require("../routes/taskRoutes"));
app.use("/api", require("../routes/workRoutes"));

app.use(notFound);
app.use(errorHandler);

// IMPORTANT: EXPORT app, don't listen
module.exports = app;
