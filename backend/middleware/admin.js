import { findUserById } from '../models/User.js';

// Checked fresh from the database (not the JWT) so a role change takes
// effect immediately instead of waiting for the token to expire.
export async function requireAdmin(req, res, next) {
  const user = await findUserById(req.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}
