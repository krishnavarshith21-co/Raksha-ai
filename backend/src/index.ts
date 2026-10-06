import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { requestId, errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { testConnection } from './database/pool';
import { migrate } from './database/migrate';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed =
      config.frontend.allowedOrigins.includes(origin) ||
      /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin);
    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts', code: 'RATE_LIMIT_EXCEEDED' },
});

const analysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many analysis requests', code: 'RATE_LIMIT_EXCEEDED' },
});

app.use(generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/actions/analyze', analysisLimiter);
app.use('/api/v1/actions/analyze', analysisLimiter);

// Root health check (for Cloud Run and load balancers, no auth required)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request ID
app.use(requestId as any);

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler as any);

// Start server
async function start() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('✓ Database connected');
      
      // Run migrations
      await migrate();
      console.log('✓ Migrations applied');
    } else {
      console.warn('⚠ Database not connected. Some features will be unavailable.');
    }

    const host = config.host || '0.0.0.0';
    app.listen(config.port, host, () => {
      console.log(`\n  RAKSHYA Backend Server`);
      console.log(`  ─────────────────────`);
      console.log(`  Environment: ${config.nodeEnv}`);
      console.log(`  Host: ${host}`);
      console.log(`  Port: ${config.port}`);
      console.log(`  Allowed Origins: ${config.frontend.allowedOrigins.join(', ')}`);
      console.log(`  Gemini AI: ${config.gemini.apiKey ? 'Configured' : 'Not configured (using heuristic fallback)'}`);
      console.log(`\n  Health: http://${host}:${config.port}/health`);
      console.log(`  API: http://${host}:${config.port}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
