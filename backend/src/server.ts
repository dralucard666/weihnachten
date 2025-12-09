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
import { testConnection, closePool } from "./database/db";
import { mediaService } from "./database/MediaService";
import { questionService } from "./database/QuestionService";
import { questionSetService } from "./database/QuestionSetService";
import multer from "multer";

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

let httpServer: ReturnType<typeof createServer> | ReturnType<typeof createHttpsServer>;
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
  max: isDevelopment ? 1000 : 500, // Higher limit for media uploads
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);
app.use(express.json());

// Configure multer for file uploads (store in memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  }
});

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

// Media endpoints

// Upload media file
app.post("/api/media/upload", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, mimetype, buffer } = req.file;
    const originalPath = req.body.originalPath || null;

    const mediaId = await mediaService.uploadMedia(
      originalname,
      buffer,
      mimetype,
      originalPath
    );

    res.json({ 
      success: true, 
      mediaId,
      filename: originalname,
      size: buffer.length
    });
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ error: "Failed to upload media" });
  }
});

// Get media file by ID
app.get("/media/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const media = await mediaService.getMediaById(id);

    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', media.mimetype);
    res.setHeader('Content-Length', media.sizeBytes);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Send binary data
    res.send(media.data);
  } catch (error) {
    console.error("Error serving media:", error);
    res.status(500).json({ error: "Failed to serve media" });
  }
});

// List all media metadata
app.get("/api/media", async (req, res) => {
  try {
    const mediaList = await mediaService.listAllMedia();
    const totalSize = await mediaService.getTotalMediaSize();
    
    res.json({
      media: mediaList,
      count: mediaList.length,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
    });
  } catch (error) {
    console.error("Error listing media:", error);
    res.status(500).json({ error: "Failed to list media" });
  }
});

// Question Set endpoints

// Create a new question set
app.post("/api/question-sets", async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: "Name is required" });
    }

    // Check if set with this name already exists
    const existing = await questionSetService.getQuestionSetByName(name);
    if (existing) {
      return res.status(409).json({ error: "Question set with this name already exists" });
    }

    const setId = await questionSetService.createQuestionSet(name, description);
    const questionSet = await questionSetService.getQuestionSetById(setId);
    
    res.json({ success: true, questionSet });
  } catch (error) {
    console.error("Error creating question set:", error);
    res.status(500).json({ error: "Failed to create question set" });
  }
});

// Get all question sets
app.get("/api/question-sets", async (req, res) => {
  try {
    const sets = await questionSetService.getAllQuestionSets(true);
    res.json({ questionSets: sets, count: sets.length });
  } catch (error) {
    console.error("Error listing question sets:", error);
    res.status(500).json({ error: "Failed to list question sets" });
  }
});

// Get a specific question set
app.get("/api/question-sets/:setId", async (req, res) => {
  try {
    const { setId } = req.params;
    const questionSet = await questionSetService.getQuestionSetById(setId);
    
    if (!questionSet) {
      return res.status(404).json({ error: "Question set not found" });
    }
    
    res.json({ questionSet });
  } catch (error) {
    console.error("Error getting question set:", error);
    res.status(500).json({ error: "Failed to get question set" });
  }
});

// Get questions in a set
app.get("/api/question-sets/:setId/questions", async (req, res) => {
  try {
    const { setId } = req.params;
    const questions = await questionSetService.getQuestionsInSet(setId);
    
    res.json({ questions, count: questions.length });
  } catch (error) {
    console.error("Error getting questions in set:", error);
    res.status(500).json({ error: "Failed to get questions" });
  }
});

// Add a question to a set
app.post("/api/question-sets/:setId/questions", async (req, res) => {
  try {
    const { setId } = req.params;
    const { questionId } = req.body;
    
    if (!questionId) {
      return res.status(400).json({ error: "questionId is required" });
    }

    // Verify question exists
    const question = await questionService.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Add to the requested set
    const added = await questionSetService.addQuestionToSet(setId, questionId);
    
    // Also ensure it's in the "all" set
    const allSets = await questionSetService.getAllQuestionSets();
    const allSet = allSets.find(s => s.name.toLowerCase() === 'all');
    if (allSet && setId !== allSet.id) {
      await questionSetService.addQuestionToSet(allSet.id, questionId);
    }
    
    res.json({ 
      success: true, 
      added,
      message: added ? "Question added to set" : "Question already in set"
    });
  } catch (error) {
    console.error("Error adding question to set:", error);
    res.status(500).json({ error: "Failed to add question to set" });
  }
});

// Remove a question from a set
app.delete("/api/question-sets/:setId/questions/:questionId", async (req, res) => {
  try {
    const { setId, questionId } = req.params;
    const removed = await questionSetService.removeQuestionFromSet(setId, questionId);
    
    if (!removed) {
      return res.status(404).json({ error: "Question not in set" });
    }
    
    res.json({ success: true, message: "Question removed from set" });
  } catch (error) {
    console.error("Error removing question from set:", error);
    res.status(500).json({ error: "Failed to remove question from set" });
  }
});

// Update question set metadata
app.patch("/api/question-sets/:setId", async (req, res) => {
  try {
    const { setId } = req.params;
    const { name, description } = req.body;
    
    const updated = await questionSetService.updateQuestionSet(setId, { name, description });
    
    if (!updated) {
      return res.status(404).json({ error: "Question set not found" });
    }
    
    const questionSet = await questionSetService.getQuestionSetById(setId);
    res.json({ success: true, questionSet });
  } catch (error) {
    console.error("Error updating question set:", error);
    res.status(500).json({ error: "Failed to update question set" });
  }
});

// Delete a question set
app.delete("/api/question-sets/:setId", async (req, res) => {
  try {
    const { setId } = req.params;
    const deleted = await questionSetService.deleteQuestionSet(setId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Question set not found" });
    }
    
    res.json({ success: true, message: "Question set deleted" });
  } catch (error) {
    console.error("Error deleting question set:", error);
    res.status(500).json({ error: "Failed to delete question set" });
  }
});

// Create question and optionally add to a set
app.post("/api/questions", async (req, res) => {
  try {
    const { type, textDe, textEn, questionSetId, ...options } = req.body;
    
    if (!type || !textDe || !textEn) {
      return res.status(400).json({ error: "type, textDe, and textEn are required" });
    }

    // Create the question
    const questionId = await questionService.createQuestion(type, textDe, textEn, options);
    
    // Always add to "all" set
    const allSets = await questionSetService.getAllQuestionSets();
    const allSet = allSets.find(s => s.name.toLowerCase() === 'all');
    if (allSet) {
      await questionSetService.addQuestionToSet(allSet.id, questionId);
    }
    
    // Optionally add to another specific set
    if (questionSetId && questionSetId !== allSet?.id) {
      await questionSetService.addQuestionToSet(questionSetId, questionId);
    }
    
    const question = await questionService.getQuestionById(questionId);
    res.json({ success: true, question });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ error: "Failed to create question" });
  }
});

// Update question text (media is immutable)
app.put("/api/questions/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;
    const { textDe, textEn, ...options } = req.body;
    
    if (!textDe || !textEn) {
      return res.status(400).json({ error: "textDe and textEn are required" });
    }

    // Update the question
    const updated = await questionService.updateQuestion(questionId, textDe, textEn, options);
    
    if (!updated) {
      return res.status(404).json({ error: "Question not found" });
    }
    
    const question = await questionService.getQuestionById(questionId);
    res.json({ success: true, question });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ error: "Failed to update question" });
  }
});

// Get all questions
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await questionService.getAllQuestions();
    res.json({ questions, count: questions.length });
  } catch (error) {
    console.error("Error getting questions:", error);
    res.status(500).json({ error: "Failed to get questions" });
  }
});

// Delete a question (cascades to all sets)
app.delete("/api/questions/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;
    const deleted = await questionService.deleteQuestion(questionId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Question not found" });
    }
    
    res.json({ success: true, message: "Question deleted from all sets" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ error: "Failed to delete question" });
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

// Initialize database connection and start server
async function startServer() {
  console.log('🔌 Testing database connection...');
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Server will start but database features will not work.');
    console.error('   Make sure PostgreSQL is running and DATABASE_URL is configured correctly.');
  }

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    if (dbConnected) {
      console.log('✅ Database connection established');
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');
    await closePool();
    httpServer.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, closing server...');
    await closePool();
    httpServer.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

startServer();
