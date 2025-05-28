import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import recipesRoutes from "./routes/recipes.js";
import { connectDB } from "./config/db.js";
import path from "path";

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
  origin: [ "https://recipe-sharing-app-kappa.vercel.app", "http://localhost:5173" ],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);       // ✅ FIXED
app.use("/api/recipes", recipesRoutes); // ✅ FIXED

app.use((err, req, res, next) => {
  console.error("Server error:", err.message, err.stack);
  res.status(500).json({ message: "Server error" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server started at port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
