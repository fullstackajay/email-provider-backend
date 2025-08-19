import { connect } from 'mongoose'
import { env } from './env'
import logger from './logger'

// This promise resolves with the Mongoose instance.
export const db = connect(env.MONGO_URI).then(
	instance => {
		console.log('✅ MongoDB connection established successfully.')
		return instance
	},
	err => {
		logger.error('❌ MongoDB connection error:', err)
		throw err
	}
)

// This promise resolves with the native MongoDB `Db` object.
// The mongodbAdapter requires this.
export const nativeDb = db.then(mongooseInstance => {
	const mongoDb = mongooseInstance.connection.db

	// This check ensures that the db object is not undefined.
	// If it is, we throw an error, causing the promise to reject.
	if (!mongoDb) {
		const err = new Error('Failed to get native MongoDB Db object from Mongoose.')
		logger.error('❌ Critical database error:', err)
		throw err
	}

	// Because of the check above, TypeScript now knows `mongoDb` is of type `Db`.
	return mongoDb
})
