import 'dotenv/config';
import { env } from './config/env.js';   // validates env vars & exports constants
import app from './app.js';
import connectDB from './config/db.js';

const start = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

start();
