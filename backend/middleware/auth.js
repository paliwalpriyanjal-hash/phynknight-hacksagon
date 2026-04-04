import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      console.log('❌ Auth Debug: No token provided or missing Bearer prefix')
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await User.findById(decoded.id)
    if (!user || !user.isActive) {
      console.log(`❌ Auth Debug: User not found or inactive for ID ${decoded.id}`)
      return res.status(401).json({ message: 'User not found or inactive' })
    }

    req.user = user
    next()
  } catch (err) {
    console.log('❌ Auth Debug: Invalid or expired token inside catch block', err.message)
    res.status(401).json({ message: 'Invalid or expired token', error: err.message })
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    console.log(`❌ Auth Debug: 403 Forbidden. User role is '${req.user.role}' but required roles are: ${roles.join(', ')}`)
    return res.status(403).json({ message: `Access denied. Required roles: ${roles.join(', ')}` })
  }
  next()
}
