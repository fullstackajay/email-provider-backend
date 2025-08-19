import type { NextFunction, Request, Response } from 'express'
import { fromNodeHeaders } from 'better-auth/node'

import { auth } from '@/src/config/auth'
import AppError from '@/src/utils/appError'
import catchAsync from '@/src/utils/catchAsync'

export const protect = catchAsync(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
	// 1. Get session from the request headers
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers)
	})

	// 2. Check if session exists and user is logged in
	if (session === null || !session.user) {
		return next(new AppError('You are not logged in. Please log in to get access.', 401))
	}

	// 3. Grant access to protected route
	req.user = session.user
	next()
})
