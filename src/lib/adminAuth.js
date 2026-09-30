import crypto from 'crypto';

export const ADMIN_COOKIE = 'mcc_admin_session';

// Session token is derived from the password, so changing ADMIN_PASSWORD logs everyone out.
export function adminToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return crypto.createHmac('sha256', password).update('mcc-admin-session').digest('hex');
}

export function checkPassword(candidate) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || typeof candidate !== 'string') return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(password);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function isAdminRequest(req) {
  const token = adminToken();
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  return Boolean(token && cookie && cookie === token);
}
