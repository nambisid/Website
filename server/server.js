require('dotenv').config();

const cron = require('node-cron');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Render's free tier sleeps a service after ~15 min of no inbound traffic,
// which would make the first checkout/login after a quiet spell wait ~40s.
// Pinging our own health endpoint every 14 min keeps it awake (free "always-on").
// Only runs on Render (RENDER_EXTERNAL_URL is set there), so local dev is untouched.
const scheduleKeepAlive = () => {
  const selfUrl = process.env.RENDER_EXTERNAL_URL;
  if (!selfUrl) return;
  cron.schedule('*/14 * * * *', async () => {
    try {
      await fetch(`${selfUrl}/api/v1/health`);
    } catch (err) {
      logger.warn(`Keep-alive ping failed: ${err.message}`);
    }
  });
  logger.info('Keep-alive scheduled (every 14 min)');
};

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  scheduleKeepAlive();
};

start();
