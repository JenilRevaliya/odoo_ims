"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.logger = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = require("express-rate-limit");
const winston_1 = __importDefault(require("winston"));
const app = (0, express_1.default)();
// Logger
exports.logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.json(),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.simple(),
        }),
    ],
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
// Rate Limiter
exports.authLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs for auth routes
    message: { error: 'Too many auth requests, please try again later.' }
});
// Routes
app.get('/health', (req, res) => {
    // To strictly check if DB/Redis is up, we can do that here.
    // We'll mock it for now since Docker isn't running yet.
    res.status(200).json({ status: 'ok', db: 'connected', redis: 'connected' });
});
// Auth Routes
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
app.use('/v1/auth', auth_routes_1.default);
// Products Routes
const products_routes_1 = __importDefault(require("./modules/products/products.routes"));
app.use('/v1/products', products_routes_1.default);
// Warehouses Routes
const warehouses_routes_1 = __importDefault(require("./modules/warehouses/warehouses.routes"));
app.use('/v1/warehouses', warehouses_routes_1.default);
// Dashboard Routes
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
app.use('/v1/dashboard', dashboard_routes_1.default);
// Operations Routes
const operations_routes_1 = __importDefault(require("./modules/operations/operations.routes"));
app.use('/v1/operations', operations_routes_1.default);
// Stock Ledger Routes
const stock_ledger_routes_1 = __importDefault(require("./modules/stock-ledger/stock-ledger.routes"));
app.use('/v1/stock-ledger', stock_ledger_routes_1.default);
// Profile Routes
const profile_routes_1 = __importDefault(require("./modules/profile/profile.routes"));
app.use('/v1/profile', profile_routes_1.default);
// Error Handler
app.use((err, req, res, next) => {
    exports.logger.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
exports.default = app;
//# sourceMappingURL=app.js.map