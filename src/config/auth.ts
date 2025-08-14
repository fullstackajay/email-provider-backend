import { betterAuth } from 'better-auth'
// import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { env } from './env'
// import { client } from "@/db"; // your mongodb client

export const auth = betterAuth({
	// The adapter connects Better Auth to your database.
	// It cleverly accepts a promise, so it will wait for the DB to be ready.
	// database: mongodbAdapter(client),

	// Pass the secret and URL from your environment variables.
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,

	// Enable the email and password authentication provider.
	emailAndPassword: {
		enabled: true
	}
	// socialProviders: {
	// 	github: {
	// 		clientId: process.env.GITHUB_CLIENT_ID as string,
	// 		clientSecret: process.env.GITHUB_CLIENT_SECRET as string
	// 	}
	// }
})
