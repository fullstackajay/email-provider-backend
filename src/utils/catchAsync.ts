import type { NextFunction, Request, Response } from 'express'

type AsyncHandler<T> = (req: Request, res: Response, next: NextFunction) => Promise<T>

const catchAsync = <T>(fn: AsyncHandler<T>) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		fn(req, res, next).catch(next)
	}
}

export default catchAsync
