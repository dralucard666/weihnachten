import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { createServer as createHttpsServer } from "https";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { ServerToClientEvents, ClientToServerEvents } from "../../shared/types";
import { SocketHandler } from "./services/SocketHandler";

const app = express();

// Check if SSL certificates exist for HTTPS
const useHttps = fs.existsSync(path.join(__dirname, "../server.key")) && 
                 fs.existsSync(path.join(__dirname, "../server.cert"));

let httpServer;
if (useHttps) {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, "../server.key")),
    cert: fs.readFileSync(path.join(__dirname, "../server.cert"))
  };
  httpServer = createHttpsServer(httpsOptions, app);
  console.log("Using HTTPS");
} else {
  httpServer = createServer(app);
  console.log("Using HTTP");
}

// Configure CORS - allow multiple origins
const isDevelopment = process.env.NODE_ENV !== "production";
const allowedOrigins = [
  isDevelopment && "http://localhost:5173",
  isDevelopment && "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (direct navigation, same-origin requests)
      if (!origin) return callback(null, true);

      if (!allowedOrigins.includes(origin)) {
        console.warn(`CORS: Blocked request from origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
      }

      callback(null, true);
    },
    credentials: true,
  })
);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: isDevelopment ? false : undefined,
    crossOriginEmbedderPolicy: false,
    //hsts: false, // Disable HSTS to prevent forcing HTTPS
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Higher limit in development
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve questions by language
app.get("/api/questions", (req, res) => {
  try {
    // Load the merged questions file
    const questionsPath = path.join(__dirname, "data", "questions.json");
    const rawQuestions = require(questionsPath);
    
    // Add IDs to questions if they don't have them
    const questions = rawQuestions.map((q: any, index: number) => ({
      ...q,
      id: q.id || `q-${index}`
    }));
    
    res.json(questions);
  } catch (error) {
    console.error("Error loading questions:", error);
    // Don't expose internal error details to client
    res.status(500).json({ error: "Failed to load questions" });
  }
});

// Serve media files - restrict to data directory with validation
app.use(
  "/media",
  express.static(path.join(__dirname, "data"), {
    dotfiles: "deny", // Prevent access to hidden files
    index: false, // Prevent directory listing
    redirect: false, // Prevent redirect exploits
  })
);

// Serve frontend static files (production only)
if (!isDevelopment) {
  console.log(`can return html`);
  const frontendPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    console.log(`returning html`);
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Initialize Socket.IO with CORS
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: allowedOrigins.filter(
      (origin): origin is string => origin !== undefined
    ),
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Initialize socket handler
const socketHandler = new SocketHandler(io);

io.on("connection", (socket) => {
  socketHandler.handleConnection(socket);
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
