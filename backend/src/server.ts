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

// Trust proxy - required when running behind a reverse proxy (nginx, load balancer, etc.)
app.set('trust proxy', true);

// Configure CORS - allow multiple origins
const isDevelopment = process.env.NODE_ENV !== "production";
const allowedOrigins = [
  isDevelopment && "http://localhost:5173",
  isDevelopment && "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

// Always use HTTP in production, only use HTTPS in development if certificates exist
const useHttps = false; // Disabled for production deployment

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

app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
  })
);

// Security headers - disabled in production to avoid conflicts
if (isDevelopment) {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
}

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

// Initialize Socket.IO with CORS
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "*", // Allow all origins
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Initialize socket handler
const socketHandler = new SocketHandler(io);

io.on("connection", (socket) => {
  socketHandler.handleConnection(socket);
});

// Serve questions - either all questions or lobby-specific shuffled questions
app.get("/api/questions", (req, res) => {
  try {
    const lobbyId = req.query.lobbyId as string | undefined;
    
    if (lobbyId) {
      // Return shuffled questions for specific lobby
      const lobbyQuestions = socketHandler.getLobbyManager().getLobbyQuestions(lobbyId);
      
      if (!lobbyQuestions) {
        return res.status(404).json({ error: "Lobby not found" });
      }
      
      // Add IDs to questions if they don't have them
      const questions = lobbyQuestions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `q-${index}`
      }));
      
      res.json(questions);
    } else {
      // Return all questions (not shuffled) for initial lobby creation
      const allQuestions = socketHandler.getAllQuestions();
      
      // Add IDs to questions if they don't have them
      const questions = allQuestions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `q-${index}`
      }));
      
      res.json(questions);
    }
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

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
