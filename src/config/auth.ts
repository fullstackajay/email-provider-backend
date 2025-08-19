import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { env, isDevelopment } from './env'
import { nativeDb } from './db'
import Email from '../utils/email'
import { emailOTP } from 'better-auth/plugins'
import { generateRandomString } from 'better-auth/crypto'

export const auth = betterAuth({
	database: mongodbAdapter(await nativeDb),

	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,

	emailAndPassword: {
		enabled: true,
		// minPasswordLength: 8,
		// resetPasswordTokenExpiresIn: 600, // 10 minutes
		requireEmailVerification: true // Enforce email verification
	},
	trustedOrigins: [env.SERVER_URL],
	telemetry: { enabled: false },
	plugins: [
		emailOTP({
			disableSignUp: true,
			// This makes the OTP flow the default for all email verifications
			overrideDefaultEmailVerification: true,
			// This function sends the OTP to the user
			generateOTP: () => {
				if (isDevelopment) return '222222' // Your static OTP for development

				// For production/staging, generate a secure random 6-digit OTP
				return generateRandomString(6, '0-9')
			},
			sendVerificationOTP: async ({ email, otp, type }) => {
				if (type === 'sign-in') {
					// Send the OTP for sign in
					await new Email({ email }, 'no-url').SendSignInCode(otp)
				} else if (type === 'email-verification') {
					// Send the OTP for email verification
					await new Email({ email }, 'no-url').sendEmailVerificationCode(otp)
				} else {
					// Send the OTP for password reset
					await new Email({ email }, 'no-url').sendResetPasswordVerificationCode(otp)
				}
				// We pass a dummy URL because the Email class requires it, but it won't be used in the OTP template.
			}
		})
	],
	databaseHooks: {
		user: {
			create: {
				after: async user => {
					try {
						// The 'url' parameter for the Email class can be your site's homepage or dashboard URL.
						await new Email(user, env.BETTER_AUTH_URL).sendWelcome()
					} catch (error) {
						// It's important to handle potential errors here, e.g., by logging them,
						// so that an email failure doesn't crash the sign-up process.
						console.error('Failed to send welcome email:', error)
					}
				}
			}
		}
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		}
	}

	//       socialProviders: {
	//     github: {
	//       clientId: process.env.GITHUB_CLIENT_ID as string,
	//       clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
	//     },
	//   },
})
