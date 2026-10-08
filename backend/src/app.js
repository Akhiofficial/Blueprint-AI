import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';
import brdRoutes from './routes/brdRoutes.js';
import generationRoutes from './routes/generationRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

const app = express();

// ── Security headers
app.use(helmet());

// ── CORS — credentials + locked origin
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ── Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Cookie parsing (reads req.cookies)
app.use(cookieParser());

// ── API routers
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/requirements', requirementRoutes);
app.use('/api/projects/:projectId/brd', brdRoutes);
app.use('/api/projects/:projectId/generations', generationRoutes);
app.use('/api/projects/:projectId/documents', documentRoutes);
app.use('/api/projects/:projectId/export', exportRoutes);


// ── Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'BlueprintAI API is running 🚀' });
});

// ── Centralized 404 route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Centralized error handler — must be LAST
app.use(errorHandler);

export default app;
