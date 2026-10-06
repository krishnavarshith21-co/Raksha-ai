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
  origin: config.frontend.url,
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

    app.listen(config.port, () => {
      console.log(`\n  RAKSHYA Backend Server`);
      console.log(`  ─────────────────────`);
      console.log(`  Environment: ${config.nodeEnv}`);
      console.log(`  Port: ${config.port}`);
      console.log(`  Frontend: ${config.frontend.url}`);
      console.log(`  Gemini AI: ${config.gemini.apiKey ? 'Configured' : 'Not configured (using heuristic fallback)'}`);
      console.log(`\n  API: http://localhost:${config.port}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
