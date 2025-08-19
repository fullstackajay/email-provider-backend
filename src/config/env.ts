import { z } from 'zod'

enum NodeEnv {
	Development = 'development',
	Staging = 'staging',
	Production = 'production'
}

const nodeEnvValues = [NodeEnv.Development, NodeEnv.Staging, NodeEnv.Production] as const

const envSchema = z.object({
	NODE_ENV: z.enum(nodeEnvValues).default(NodeEnv.Development),
	PORT: z.coerce.number().int().positive().default(3000),
	SERVER_URL: z.url(),
	MONGO_URI: z.url().startsWith('mongodb', { error: 'MONGO_URI must be a valid MongoDB connection string' }),
	EMAIL_USERNAME: z.string().min(1, 'EMAIL_USERNAME cannot be empty'),
	EMAIL_PASSWORD: z.string().min(1, 'EMAIL_PASSWORD cannot be empty'),
	EMAIL_HOST: z.string().min(1, 'EMAIL_HOST cannot be empty'),
	EMAIL_PORT: z.coerce.number().int().positive(),
	EMAIL_FROM: z.email(),
	BETTER_AUTH_SECRET: z.string().min(1),
	BETTER_AUTH_URL: z.url(),
	JWT_SECRET: z.string().min(10, 'JWT_SECRET cannot be empty and must be at least 10 characters long'),
	JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
	JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
	GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID cannot be empity'),
	GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET cannot be empity'),
	JWT_EXPIRES_IN: z.templateLiteral([z.number(), z.enum(['d', 's'])])
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
	console.error('❌ Invalid environment variables:', z.treeifyError(parsedEnv.error).properties)
	throw new Error('Invalid environment variables. Application cannot start.')
}

export type EnvVars = z.infer<typeof envSchema>

export const env: EnvVars = parsedEnv.data

export const isDevelopment: boolean = env.NODE_ENV === NodeEnv.Development
export const isStaging: boolean = env.NODE_ENV === NodeEnv.Staging
export const isProduction: boolean = env.NODE_ENV === NodeEnv.Production
