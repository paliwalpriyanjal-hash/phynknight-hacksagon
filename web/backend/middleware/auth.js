import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' })

    const token = auth.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user || !user.isActive) return res.status(401).json({ message: 'User not found or inactive' })

    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Required roles: ${roles.join(', ')}` })
  }
  next()
}
