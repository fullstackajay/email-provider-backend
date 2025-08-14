import { z } from 'zod'
import ms, { type StringValue } from 'ms'

export enum NodeEnv {
	Development = 'development',
	Staging = 'staging',
	Production = 'production'
}

const nodeEnvValues = [NodeEnv.Development, NodeEnv.Staging, NodeEnv.Production] as const

const msLike = /^[0-9]+(ms|s|m|h|d|w|y)$/

const envSchema = z.object({
	NODE_ENV: z.enum(nodeEnvValues).default(NodeEnv.Development),
	PORT: z.coerce.number().int().positive().default(3000),
	MONGO_URI: z.url().startsWith('mongodb', { error: 'MONGO_URI must be a valid MongoDB connection string' }),
	EMAIL_USERNAME: z.string().min(1, 'EMAIL_USERNAME cannot be empty'),
	EMAIL_PASSWORD: z.string().min(1, 'EMAIL_PASSWORD cannot be empty'),
	EMAIL_HOST: z.string().min(1, 'EMAIL_HOST cannot be empty'),
	EMAIL_PORT: z.coerce.number().int().positive(),
	EMAIL_FROM: z.email(),
	BETTER_AUTH_SECRET: z.string().min(1),
	BETTER_AUTH_URL: z.url(),
	JWT_SECRET: z.string().min(10, 'JWT_SECRET cannot be empty and must be at least 10 characters long'),
	JWT_EXPIRES_IN: z
		.string()
		.min(1, 'JWT_EXPIRES_IN cannot be empty')
		.regex(msLike, "JWT_EXPIRES_IN must be a valid ms time format, e.g., '1d', '3600s'")
		.refine(val => typeof ms(val as StringValue) === 'number', {
			message: 'JWT_EXPIRES_IN must be a valid ms time string'
		})
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
	console.error('❌ Invalid environment variables:', z.treeifyError(parsedEnv.error).properties)
	throw new Error('Invalid environment variables. Application cannot start.')
}

export type EnvVars = z.infer<typeof envSchema>

const _env = parsedEnv.data

type EnvVarsWithMs = Omit<EnvVars, 'JWT_EXPIRES_IN'> & {
	JWT_EXPIRES_IN: StringValue
}

export const env: EnvVars = {
	..._env,
	JWT_EXPIRES_IN: _env.JWT_EXPIRES_IN as StringValue
} as EnvVarsWithMs

export const isProduction: boolean = env.NODE_ENV === NodeEnv.Production
export const isDevelopment: boolean = env.NODE_ENV === NodeEnv.Development
export const isStaging: boolean = env.NODE_ENV === NodeEnv.Staging
