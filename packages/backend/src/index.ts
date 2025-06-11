import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/database";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import tweepRoutes from "./routes/tweeps";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;

const app = express();

// Connect to MongoDB
connectDB();

// Middleware for parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tweeps', tweepRoutes);

app.get("/api/hello", (req: Request, res: Response) => {
    res.json({ message: "Hello from API!" });
});

app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

// Serve static files from the React app build directory
const frontendBuildPath = path.join(__dirname, "../../frontend/dist");

app.use(express.static(frontendBuildPath));

// Catch all handler: send back React's index.html file for any non-API routes
app.get("*", (req: Request, res: Response) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API endpoint not found' });
        return;
    }
    
    res.sendFile(path.join(frontendBuildPath, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Serving frontend from: ${frontendBuildPath}`);
});
