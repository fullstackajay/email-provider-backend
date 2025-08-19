import type { NextFunction, Request, Response } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../config/auth'

export const getMe = (req: Request, res: Response, _next: NextFunction): void => {
	res.status(200).json({
		status: 'success',
		data: {
			user: req.user
		}
	})
}

export const signOut = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
	// 1. Invalidate the session on the server side. We don't need its return value.
	await auth.api.signOut({
		headers: fromNodeHeaders(req.headers)
	})

	// --- Why we must manually clear the session cookie ---
	//
	// 1. Correct Frontend State: Prevents the client application from mistakenly thinking a user is still logged in.
	//
	// 2. Efficiency: Stops the browser from sending a now-useless cookie with every subsequent API request. Without this, the server would be forced to:
	//      a. Receive the invalid cookie.
	//      b. Perform a database lookup for a session that no longer exists.
	//      c. Reject the request with a 401 error.
	//    Clearing the cookie avoids this unnecessary network and database overhead.
	//
	// 3. Completeness: Ensures the sign-out process is finalized on both the server (session invalidation) and the client (cookie removal).
	res.cookie('better-auth.session_token', '', {
		httpOnly: true,
		path: '/',
		expires: new Date(0)
	})

	// 3. Send the final success response.
	res.status(200).json({ status: 'success', message: 'You have been signed out.' })
}
