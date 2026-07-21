import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

const app = express();

// ── Security headers
app.use(helmet());

// ── CORS — credentials + locked origin
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl) or common local dev origins
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) || origin === process.env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// ── Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Cookie parsing (reads req.cookies)
app.use(cookieParser());

// ── Rate limiter removed for now

// ── API routers
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// ── Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'BlueprintAI API is running 🚀' });
});

// ── Centralized error handler — must be LAST
app.use(errorHandler);

export default app;
