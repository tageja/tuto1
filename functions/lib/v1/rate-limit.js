"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readRateLimit = exports.writeRateLimit = exports.rateLimit = void 0;
const rateLimitStore = new Map();
const rateLimit = (windowMs, maxRequests) => {
    return (req, res, next) => {
        const identifier = req.user?.uid || req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;
        const entry = rateLimitStore.get(identifier);
        if (!entry || entry.resetTime < now) {
            // New window or expired entry
            rateLimitStore.set(identifier, {
                count: 1,
                resetTime: now + windowMs
            });
            next();
            return;
        }
        if (entry.count >= maxRequests) {
            // Rate limit exceeded
            res.status(429).json({
                success: false,
                code: 'RATE_LIMITED',
                message: 'Too many requests',
                retryAfter: Math.ceil((entry.resetTime - now) / 1000)
            });
            return;
        }
        entry.count++;
        next();
    };
};
exports.rateLimit = rateLimit;
exports.writeRateLimit = (0, exports.rateLimit)(60000, 10); // 10 writes per minute
exports.readRateLimit = (0, exports.rateLimit)(60000, 100); // 100 reads per minute
