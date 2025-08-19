import 'source-map-support/register.js'

// Don't realy on this unhandledRejection and uncaughtException.
// We need to handle errors where they originate.
// This is just a safety net.

// This will catch all unhandle bug, syncronus error.
process.on('uncaughtException', (err: Error) => {
	console.log('UNCAUGHT EXCEPTION! Shutting down..j.')
	console.log(err.name, err.message)
	process.exit(1) // 1 = REJECTED, 0 = SUCCESS
})

// Handle all the async error before db connet, server start.
process.on('unhandledRejection', (error: Error) => {
	console.error('UNHANDLED REJECTION! Before 💥 Shutting down...', error)
	process.exit(1)
})

import app from '@/src/app'
import { env } from '@/src/config/env'
import logger from './config/logger'
import { db } from './config/db'

const startServer = async (): Promise<void> => {
	try {
		// Wait for database connection
		await db

		const server = app.listen(env.PORT, () => {
			console.log(`🚀 Server is running on port ${env.PORT}`)
		})

		// Error handler for server startup
		server.on('error', (error: Error) => {
			logger.error('Server error:', { error })
			process.exit(1) // Exit the process if there's a server error
		})

		// Add the unhandledRejection handler after the server is initialized
		// This will handle all the unhandled errors in our application.
		// We need to restart the server in production after it's shutdown.
		process.removeAllListeners('unhandledRejection')
		process.on('unhandledRejection', (error: Error) => {
			logger.error('UNHANDLED REJECTION! 💥 Shutting down...', { error })

			if (server) {
				server.close(() => process.exit(1))
			} else {
				logger.error('Server not initialized, exiting immediately.')
				process.exit(1)
			}
		})
	} catch (error: unknown) {
		logger.error('❌ Failed to connect to the database. Application cannot start.', error)
		process.exit(1)
	}
}

// Start the server
startServer().catch(error => {
	console.error('Error during server startup:', error)
	process.exit(1)
})
