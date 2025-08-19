import type { Request, Response, NextFunction } from 'express'
import AppError from '../utils/appError' // Assuming this path is correct
import { isDevelopment, isProduction } from '@/src/config/env'

// --- Define interfaces for known error structures ---

// For Mongoose CastError
interface MongooseCastError extends Error {
	name: 'CastError'
	path: string
	value: unknown // Changed from any to unknown
	statusCode?: number
	status?: string
}

// For Mongoose Duplicate Key Error
interface MongooseDuplicateKeyError extends Error {
	name: string // Usually 'MongoServerError' or 'MongoError' but code is more reliable
	code: 11000
	errmsg: string // Mongoose errmsg is a string
	keyValue?: Record<string, unknown> // Changed from any to unknown
	statusCode?: number
	status?: string
}

// For Mongoose ValidationError
interface MongooseValidationRuleError {
	// Helper for individual validation errors
	message: string
	kind?: string
	path?: string
	value?: unknown // Changed from any to unknown
	// Add other properties Mongoose might put here if you need them
}

interface MongooseValidationError extends Error {
	name: 'ValidationError'
	errors: {
		[key: string]: MongooseValidationRuleError
	}
	statusCode?: number
	status?: string
}

// --- Union type for errors we explicitly handle or can originate ---
type PotentialError = (Error | AppError | MongooseCastError | MongooseDuplicateKeyError | MongooseValidationError) & {
	statusCode?: number
	status?: string
	isOperational?: boolean
	code?: number // For duplicate key errors, etc.
	path?: string // For CastError
	value?: unknown // For CastError, changed from any to unknown
	errmsg?: string // For DuplicateKeyError
	errors?: { [key: string]: { message: string; value?: unknown } } // For ValidationError
}

type HandledError = PotentialError & {
	statusCode: number
	status: string
}

const sendErrorDev = (err: HandledError, res: Response): void => {
	// When serializing `err` to JSON, properties of type `unknown`
	// will be handled by JSON.stringify (e.g., objects become object literals, primitives as themselves)
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack
	})
}

const sendErrorProd = (err: HandledError, res: Response): void => {
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message
		})
	} else {
		console.error('ERROR 💥', err)
		res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!'
		})
	}
}

export default (rawErr: PotentialError, _req: Request, res: Response, _next: NextFunction): void => {
	rawErr.statusCode = rawErr.statusCode || 500
	rawErr.status = rawErr.status || 'error'

	const err = rawErr as HandledError

	if (isDevelopment) {
		sendErrorDev(err, res)
	} else if (isProduction) {
		// Create a new variable for the error. Start with a copy.
		// The type allows for it to be a general HandledError or specifically an AppError
		// after transformation.
		let errorForProd: HandledError | AppError = {
			name: err.name,
			message: err.message,
			stack: err.stack,
			statusCode: err.statusCode,
			status: err.status,
			isOperational: err.isOperational,
			// Conditionally spread properties if they exist on 'err'.
			// This helps maintain type safety and avoids adding undefined properties unnecessarily.
			...(err.code !== undefined && { code: err.code }),
			...(err.path !== undefined && { path: err.path }),
			...(err.value !== undefined && { value: err.value }), // err.value is unknown
			...(err.errmsg !== undefined && { errmsg: err.errmsg }),
			...(err.errors !== undefined && { errors: err.errors })
		}

		// Handle Mongoose CastError
		// Type guard: check `name` first.
		if (errorForProd.name === 'CastError') {
			// Further narrow down to MongooseCastError structure using properties
			// This cast is safe because of the name check and the expected structure
			const castError = errorForProd as MongooseCastError
			// `castError.value` is `unknown`. String interpolation handles `unknown` by calling .toString().
			errorForProd = new AppError(`Invalid ${castError.path}: ${String(castError.value)}`, 400)
		}
		// Handle Mongoose Duplicate Key Error
		// Check for `code` before `errmsg` as `errmsg` could exist on other errors too
		else if (errorForProd.code === 11000) {
			// This cast is safe due to the code check
			const duplicateKeyError = errorForProd as MongooseDuplicateKeyError
			const errmsg = duplicateKeyError.errmsg || '' // errmsg is string
			const match = errmsg.match(/(["'])(\\?.)*?\1/)
			const matchedValue = match && match[0] ? match[0] : 'provided value'
			errorForProd = new AppError(`Duplicate field value: ${matchedValue}. Please use another value!`, 400)
		}
		// Handle Mongoose Validation Error
		else if (errorForProd.name === 'ValidationError') {
			// This cast is safe due to the name check
			const validationError = errorForProd as MongooseValidationError
			// Safely access errors, default to a generic message if `errors` is not present
			const errorMessages = validationError.errors
				? Object.values(validationError.errors).map(el => el.message)
				: ['Invalid input']
			errorForProd = new AppError(`Invalid input data. ${errorMessages.join('. ')}`, 400)
		}

		sendErrorProd(errorForProd, res)
	}
}
