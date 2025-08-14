// class APIFeatures<T> {
// 	_query: T
// 	_queryFind: T
// 	_reqQuery: Record<string, string>

// 	constructor(query: T, reqQuery: Record<string, string>) {
// 		this._query = query
// 		this._queryFind = query.find()
// 		this._reqQuery = reqQuery
// 	}

// 	// Filtering
// 	filter(allowedFilterKeys: string[] = []): APIFeatures<T> {
// 		const dataFilteringQuery: Record<string, string> = { ...this._reqQuery }
// 		const systemKeys: string[] = ['page', 'sort', 'limit', 'fields']

// 		systemKeys.forEach((el: string) => {
// 			if (Object.prototype.hasOwnProperty.call(dataFilteringQuery, el)) {
// 				delete dataFilteringQuery[el]
// 			}
// 		})

// 		for (const key in dataFilteringQuery) {
// 			if (Object.prototype.hasOwnProperty.call(dataFilteringQuery, key)) {
// 				if (!allowedFilterKeys.includes(key)) {
// 					throw new Error(
// 						`Invalid filter parameter: '${key}'. Allowed data filter parameters are: ${
// 							allowedFilterKeys.length > 0 ? allowedFilterKeys.join(', ') : 'none'
// 						}. System parameters (page, sort, limit, fields) are handled by other APIFeatures methods.`
// 					)
// 				}
// 			}
// 		}

// 		// // 1.B ADVANCE FILTERING
// 		if (Object.keys(dataFilteringQuery).length > 0) {
// 			let queryStr = JSON.stringify(dataFilteringQuery)
// 			queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

// 			// this._query = this._query.find(JSON.parse(queryStr))
// 		}
// 		// let queryStr = JSON.stringify(queryObj)
// 		// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

// 		// this._query = this._query.find(JSON.parse(queryStr))
// 		return this
// 	}
// }

// export default APIFeatures
