// middleware/rateLimiter.js

import { NextResponse } from 'next/server';
import rateLimit from 'next-rate-limit';

// Initialize the rate limiter
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500, // Max 500 unique IPs per 15 minutes
});

export default async function apiLimiter(req) {
  // try {
  //   const identifier =
  //     req.ip ||
  //     req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
  //     'unknown';

  //   // Check if the rate limit has been exceeded
  //   await limiter.check(req, 100, identifier); // 100 requests per 15 minutes per IP

  //   return null; // Not rate limited
  // } catch {
  //   return NextResponse.json(
  //     { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  //     { status: 429 }
  //   );
  // }
}
