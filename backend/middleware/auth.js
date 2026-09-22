import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Unauthorized: missing bearer token' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not set.');
    return res.status(500).json({ message: 'Server auth is not configured' });
  }

  try {
    const payload = jwt.verify(token, secret);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized: invalid or expired token' });
  }
}
