// GLOBAL IMPORT
import path from 'path'
import express from 'express'
import type { NextFunction, Request, Response, Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import mongoSanitize from 'express-mongo-sanitize'
import { xss } from 'express-xss-sanitizer'
import compression from 'compression'
import hpp from 'hpp'
import { toNodeHandler } from 'better-auth/node'

// LOCAL IMPORT
import globalErrorHandler from '@/src/middlewares/globalErrorHandler'
import AppError from '@/src/utils/appError'
import userRouter from './routes/user.routes'
import { auth } from './config/auth'

const app: Express = express()

app.use(
	cors({
		origin: 'http://localhost:3000', // Allow requests only from this origin
		methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
		credentials: true // Include cookies and other credentials
	})
)

app.set('views', path.join(__dirname, 'views'))

// 1. MIDDLEWARES

// GLOBAL MIDDLEWARE

// Set security HTTP headers
app.use(helmet())

const limiter: RateLimitRequestHandler = rateLimit({
	max: 30,
	windowMs: 60 * 60 * 1000,
	message: 'To many request.'
})

app.use('/api', limiter)

app.all('/api/auth/*', toNodeHandler(auth))

// This is an middleware.
// Out of the box exprees does not put body data on the request.
// Express does not put the body data inside request out of the box.
// Thus we need a middleware so the data will be avaliable inside request.
app.use(express.json({ limit: '10kb' })) // Parse JSON bodies

app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// This is to parse cookie comming from frontend.
app.use(cookieParser())

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent Parameter Pollution
app.use(
	hpp({
		whitelist: ['duration', 'ratingQuantity', 'ratingAverage', 'maxGroupSize', 'difficulty', 'price']
	})
)

// This middleware is for serving static files.
// serve static files, html, png. http://localhost:3000/img/pin.png
app.use(express.static(path.join(__dirname, 'public')))

app.use(compression())

// 2. ROUTES
app.use('/api/v1/users', userRouter)

// This should be at last catch all unhandled routes.
// all -> get, post etc.
app.all('/{*any}', (req: Request, _res: Response, next: NextFunction): void => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

// 3. ERROR HANDLING
// Global error handling middleware
app.use(globalErrorHandler)

// 4. SERVER
export default app
