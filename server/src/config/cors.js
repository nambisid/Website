/**
 * CORS configuration that accepts:
 *   - the configured CORS_ORIGIN(s) (comma-separated for multiple)
 *   - localhost (any port) for local development
 *   - cloudflared / ngrok / Render / Vercel subdomains so the dev tunnel works
 *
 * In production, set CORS_ORIGIN explicitly (e.g. https://stitchandbloom.com)
 * to lock it down.
 */
const allowedHostPatterns = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /\.trycloudflare\.com$/,
  /\.ngrok-free\.app$/,
  /\.ngrok\.app$/,
  /\.ngrok\.io$/,
  /\.onrender\.com$/,
  /\.vercel\.app$/,
  /\.netlify\.app$/,
];

const configuredOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const isAllowed = (origin) => {
  if (!origin) return true; // same-origin or curl
  if (configuredOrigins.includes(origin)) return true;
  return allowedHostPatterns.some((re) => re.test(origin));
};

const corsOptions = {
  origin: (origin, cb) => {
    if (isAllowed(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
