const path = require('path');

require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./config/redis');
const { validateEnv } = require('./src/config/env');


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  validateEnv();

  await connectDB();

  // Connect Redis asynchronously so it doesn't block server boot if Redis is offline
  connectRedis().catch(err => console.error('Redis connection failed on startup:', err.message));

  app.listen(PORT, () => {
    console.log(`ShelfForge API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

startServer();
