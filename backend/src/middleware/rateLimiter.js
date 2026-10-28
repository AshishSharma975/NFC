import rateLimit from "express-rate-limit";

// High-capacity API limiter (allows continuous admin dashboard work and fast live search)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Generous limit: up to 1,000 API requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Never throttle legitimate authenticated admin requests
    return Boolean(req.headers["x-admin-key"]);
  },
  message: {
    success: false,
    message: "Rate limit reached. Please wait a moment and try again.",
  },
});

// High-throughput NFC & QR scan limiter (allows hundreds of simultaneous store customers on shared Wi-Fi)
export const scanLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 2000, // 2,000 taps per 5 mins per IP (covers busy retail stores, restaurants, events)
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many scan attempts from this connection. Please wait a few seconds.",
});
