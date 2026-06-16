const path = require('path');

require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { validateEnv } = require('./src/config/env');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  validateEnv();
  await connectDB();

  app.listen(PORT, () => {
    console.log(`ShelfForge API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

startServer();
