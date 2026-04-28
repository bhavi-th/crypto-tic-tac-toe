import jwt from 'jsonwebtoken';
import { JWT_SECRETKEY } from '../config/serverConfig.js';

export async function authenticateToken(req, res, next) {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(401).json({ message: 'No Token Found' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRETKEY);
    req.address = decoded.address;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
