
import AppError from '../utils/error.utils.js'
import jwt from 'jsonwebtoken'

export const isLoggedIn = async (req, res, next) => {
     const {token} = req.cookies
     if(!token){
        return next (new AppError('Unauthenticated, please login' , 400))
     }

     const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

     req.user = userDetails;
     next()
}

// ...roles => rest parameter, It collects multiple arguments into an array.
export const authorizedRoles = (...roles) => async (req, res, next) => {
   const currentUserRoles = req.user.role;
   if(!roles.includes(currentUserRoles)){
      return next(new AppError("you are not authorized, ", 402))
   }
  next()
}


export default isLoggedIn 