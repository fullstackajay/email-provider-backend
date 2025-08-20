import { Router } from 'express'
import { protect, restrictTo } from '../middlewares/auth.middleware'
import { getMe, signOut } from '../controllers/user.controller'
import catchAsync from '../utils/catchAsync'

const userRouter: Router = Router()

// All routes after this middleware are protected
userRouter.use(protect)

userRouter.get('/me', getMe)
userRouter.post('/sign-out', catchAsync(signOut))

// Example of a route restricted to Admin and SuperAdmin roles
userRouter.get('/admin/dashboard-stats', restrictTo('Admin', 'SuperAdmin'), (_req, res) => {
	res.status(200).json({
		status: 'success',
		data: {
			message: 'Here are the admin dashboard stats!'
		}
	})
})

// Example of a route for marketers and editors
userRouter.post('/campaigns', restrictTo('Marketer', 'Editor'), (_req, res) => {
	res.status(201).json({
		status: 'success',
		data: {
			message: 'Campaign created!'
		}
	})
})

export default userRouter
