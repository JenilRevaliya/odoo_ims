import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import winston from 'winston';

const app: Express = express();

// Logger
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(express.json());

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Rate Limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth routes
  message: { error: 'Too many auth requests, please try again later.' }
});

// Health Check
const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', db: 'connected', redis: 'connected' });
};

app.get('/health', healthCheck);
app.get('/v1/health', healthCheck);

// Auth Routes
import authRoutes from './modules/auth/auth.routes';
app.use('/v1/auth', authRoutes);

// Products Routes
import productsRoutes from './modules/products/products.routes';
app.use('/v1/products', productsRoutes);

// Warehouses Routes
import warehousesRoutes from './modules/warehouses/warehouses.routes';
app.use('/v1/warehouses', warehousesRoutes);

// Dashboard Routes
import dashboardRoutes from './modules/dashboard/dashboard.routes';
app.use('/v1/dashboard', dashboardRoutes);

// Operations Routes
import operationsRoutes from './modules/operations/operations.routes';
app.use('/v1/operations', operationsRoutes);

// Stock Ledger Routes
import stockLedgerRoutes from './modules/stock-ledger/stock-ledger.routes';
app.use('/v1/stock-ledger', stockLedgerRoutes);

// Profile Routes
import profileRoutes from './modules/profile/profile.routes';
app.use('/v1/profile', profileRoutes);

// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
