// Simple in-memory rate limiter for unauthenticated users
// In production, consider using Redis/Vercel KV for persistence across instances

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const UNAUTHENTICATED_DAILY_LIMIT = 10; // 10 messages per day for unauthenticated users
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function checkRateLimit(identifier: string): {
	allowed: boolean;
	remaining: number;
	resetAt: Date;
} {
	const now = Date.now();
	const entry = rateLimitStore.get(identifier);

	// Clean up expired entries periodically
	if (rateLimitStore.size > 10000) {
		for (const [key, value] of rateLimitStore.entries()) {
			if (value.resetAt < now) {
				rateLimitStore.delete(key);
			}
		}
	}

	if (!entry || entry.resetAt < now) {
		// Create new entry
		const resetAt = now + DAY_IN_MS;
		rateLimitStore.set(identifier, { count: 1, resetAt });
		return {
			allowed: true,
			remaining: UNAUTHENTICATED_DAILY_LIMIT - 1,
			resetAt: new Date(resetAt),
		};
	}

	if (entry.count >= UNAUTHENTICATED_DAILY_LIMIT) {
		return {
			allowed: false,
			remaining: 0,
			resetAt: new Date(entry.resetAt),
		};
	}

	// Increment count
	entry.count++;
	rateLimitStore.set(identifier, entry);

	return {
		allowed: true,
		remaining: UNAUTHENTICATED_DAILY_LIMIT - entry.count,
		resetAt: new Date(entry.resetAt),
	};
}

export function getClientIp(request: Request): string {
	// Check various headers for client IP (in order of preference)
	const forwardedFor = request.headers.get("x-forwarded-for");
	if (forwardedFor) {
		// x-forwarded-for can contain multiple IPs, take the first one
		return forwardedFor.split(",")[0].trim();
	}

	const realIp = request.headers.get("x-real-ip");
	if (realIp) {
		return realIp;
	}

	// Vercel-specific header
	const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
	if (vercelForwardedFor) {
		return vercelForwardedFor.split(",")[0].trim();
	}

	// Fallback
	return "unknown";
}
