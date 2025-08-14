import { isDevelopment, isStaging, isProduction, env } from './env'
import winston, { type Logger as WinstonLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'
import fs from 'fs'
import os from 'os'

let appVersion: string = 'unknown'

try {
	const packageJsonPath = path.join(process.cwd(), 'package.json')
	if (fs.existsSync(packageJsonPath)) {
		const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
			version: string
		}
		appVersion = packageJsonContent.version || 'unknown'
	}
} catch (error) {
	console.error('Could not read app version from package.json', error)
}

const { combine, timestamp, printf, colorize, errors, json } = format

type LogLevelKey = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly'

const customLevels: Record<LogLevelKey, number> = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	verbose: 4,
	debug: 5,
	silly: 6
}
const levelColors: Record<LogLevelKey, string> = {
	error: 'red',
	warn: 'yellow',
	info: 'green',
	http: 'magenta',
	verbose: 'cyan',
	debug: 'white',
	silly: 'gray'
}
winston.addColors(levelColors)

const getEffectiveLogLevel = (): LogLevelKey => {
	// const envLogLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevelKey;
	// if (envLogLevel && customLevels[envLogLevel] !== undefined) return envLogLevel;
	return isDevelopment ? 'debug' : 'info'
}
const effectiveLogLevel: LogLevelKey = getEffectiveLogLevel()

const devConsoleFormat = combine(
	timestamp(), // ISO 8601 timestamp
	errors({ stack: true }), // Start with the base essentials
	colorize({ all: true }),
	printf(logEntry => {
		// logEntry is of type winston.Logform.TransformableInfo
		// The `timestamp` formatter ensures logEntry.timestamp is a string.
		// The `colorize` formatter wraps the level string with ANSI codes, so logEntry.level is also a string.
		const { timestamp: entryTimestamp, level: entryLevel, message, stack, ...meta } = logEntry

		// Ensure all parts for the template literal are strings
		const tsStr: string = String(entryTimestamp) // Timestamp from `winston.format.timestamp` is already a string
		const levelStr: string = String(entryLevel) // Level (possibly colorized) is a string

		const messageStr = typeof message === 'string' ? message : JSON.stringify(message)
		const stackStr = typeof stack === 'string' ? stack : ''

		const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''

		const finalLogMessage = stackStr ? stackStr : messageStr

		return `${tsStr} ${levelStr}: ${finalLogMessage} ${metaString}`
	})
)

const structuredJsonFormat = combine(
	timestamp(), // ISO 8601 timestamp
	errors({ stack: true }),
	json()
)

const loggerTransports: winston.transport[] = []

if (isDevelopment) {
	loggerTransports.push(
		new transports.Console({
			format: devConsoleFormat,
			level: effectiveLogLevel,
			handleExceptions: true,
			handleRejections: true
		})
	)
} else {
	// Staging & Production Console
	loggerTransports.push(
		new transports.Console({
			format: structuredJsonFormat,
			level: effectiveLogLevel,
			handleExceptions: true,
			handleRejections: true
		})
	)
}

const logDirectory = path.join(process.cwd(), 'logs')
// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
	try {
		fs.mkdirSync(logDirectory, { recursive: true })
	} catch (error) {
		// Fallback to console if directory creation fails, critical for logger setup
		console.error('Failed to create log directory:', error)
	}
}

if (isStaging || isProduction) {
	const dailyRotateFileOptionsBase = {
		format: structuredJsonFormat,
		datePattern: 'YYYY-MM-DD',
		zippedArchive: true,
		maxSize: '20m', // Rotate if file exceeds 20MB
		dirname: logDirectory
	}

	loggerTransports.push(
		new DailyRotateFile({
			...dailyRotateFileOptionsBase,
			filename: 'app-%DATE%.log',
			level: 'info',
			maxFiles: '14d' // Keep for 14 days
		})
	)
	loggerTransports.push(
		new DailyRotateFile({
			...dailyRotateFileOptionsBase,
			filename: 'error-%DATE%.log',
			level: 'error',
			maxFiles: '30d' // Keep error logs longer
		})
	)
	loggerTransports.push(
		new DailyRotateFile({
			...dailyRotateFileOptionsBase,
			filename: 'exceptions-%DATE%.log',
			handleExceptions: true,
			handleRejections: true,
			maxFiles: '60d' // Keep exception logs even longer
		})
	)
}

const logger: WinstonLogger = winston.createLogger({
	levels: customLevels,
	level: effectiveLogLevel,
	defaultMeta: {
		service: 'my-app',
		// service: env.SERVICE_NAME || 'my-app',
		environment: env,
		appVersion: appVersion,
		hostname: os.hostname(),
		pid: process.pid
	},
	transports: loggerTransports,
	exitOnError: false
})

// If appVersion was read after logger creation (less ideal but possible)
// if (logger.defaultMeta.appVersion === 'unknown' && appVersion !== 'unknown') {
// 	logger.defaultMeta.appVersion = appVersion
// }

export default logger
