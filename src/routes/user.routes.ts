import { Router } from 'express'
import { protect } from '../middlewares/auth.middleware'
import { getMe, signOut } from '../controllers/user.controller'
import catchAsync from '../utils/catchAsync'

const userRouter: Router = Router()

// All routes after this middleware are protected
userRouter.use(protect)

userRouter.get('/me', getMe)
userRouter.post('/sign-out', catchAsync(signOut))

export default userRouter
