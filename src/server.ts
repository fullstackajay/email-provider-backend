import 'source-map-support/register.js'

// Don't realy on this unhandledRejection and uncaughtException.
// We need to handle errors where they originate.
// This is just a safety net.

// This will catch all unhandle bug, syncronus error.
process.on('uncaughtException', (err: Error) => {
	console.log('UNCAUGHT EXCEPTION! Shutting down...')
	console.log(err.name, err.message)
	process.exit(1) // 1 = REJECTED, 0 = SUCCESS
})

import { connect } from 'mongoose'
import { env } from '@/src/config/env'
import app from '@/src/app'

connect(env.MONGO_URI)
	.then(() => {
		console.log('DB connect')
		const server = app.listen(env.PORT, () => {
			console.log(`Server is running on port ${env.PORT}`)
		})
		// Error handler for server startup
		server.on('error', (err: Error) => {
			console.error('Server error:', err.message)
			process.exit(1) // Exit the process if there's a server error
		})

		// Add the unhandledRejection handler inside the then block after the server is initialized
		// This will handle all the unhandled errors in our application.
		// We need to restart the server in production after it's shutdown.
		process.on('unhandledRejection', (err: Error) => {
			console.log('UNHANDLED REJECTION! 💥 Shutting down...')
			console.log(err.name, err.message)

			if (server) {
				server.close(() => process.exit(1))
			} else {
				console.error('Server not initialized, exiting immediately.')
				process.exit(1)
			}
		})
	})
	.catch(() => console.log('DB error'))
