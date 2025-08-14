declare module 'express-xss-sanitizer' {
	import { type Request, type RequestHandler } from 'express'

	/**
	 * Returns an Express middleware that sanitizes all input sources (body, query, params, headers)
	 */
	export function xss(): RequestHandler

	/**
	 * Sanitizes relevant parts of the request (body, query, params, headers).
	 * This generally mutates the request in-place.
	 */
	export function sanitizeRequest(req: Request): Request

	/**
	 * Deep-sanitizes a plain object (body, record, etc.).
	 * Returns a new sanitized object or the same object with cleaned properties.
	 */
	export function sanitizeObject<T extends object>(obj: T): T
}
