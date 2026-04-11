import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kalyanam-studio-secret-key-2025';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export function generateSlug(groomName, brideName) {
  const clean = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  return `${clean(groomName)}-weds-${clean(brideName)}`;
}
