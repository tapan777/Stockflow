const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const send = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'stockflow_secret_dev';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

async function signup(req, res) {
  const { email, password, organizationName } = req.body;

  if (!email || !password || !organizationName) {
    return send.badRequest(res, 'Email, password, and organization name are required');
  }
  if (password.length < 6) {
    return send.badRequest(res, 'Password must be at least 6 characters');
  }

  try {
    const existing = await authService.findUserByEmail(email);
    if (existing) return send.conflict(res, 'This email is already registered');

    const { userId, orgId, email: userEmail, organizationName: orgName } =
      await authService.createUserWithOrg(email, password, organizationName);

    return send.created(res, {
      token: signToken({ userId, orgId, email: userEmail }),
      user: { id: userId, email: userEmail, organizationId: orgId, organizationName: orgName },
    }, `Welcome to StockFlow! Your account has been created.`);
  } catch (err) {
    console.error('[signup]', err);
    return send.serverError(res);
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return send.badRequest(res, 'Email and password are required');
  }

  try {
    const user = await authService.verifyCredentials(email, password);
    if (!user) return send.unauthorized(res, 'Invalid email or password');

    return send.ok(res, {
      token: signToken({ userId: user.id, orgId: user.organization_id, email: user.email }),
      user: { id: user.id, email: user.email, organizationId: user.organization_id, organizationName: user.org_name },
    }, `Welcome back, ${user.org_name}!`);
  } catch (err) {
    console.error('[login]', err);
    return send.serverError(res);
  }
}

async function me(req, res) {
  try {
    const user = await authService.getUserById(req.user.userId);
    if (!user) return send.notFound(res, 'User not found');

    return send.ok(res, {
      id: user.id,
      email: user.email,
      organizationId: user.organization_id,
      organizationName: user.org_name,
    }, 'User retrieved');
  } catch (err) {
    console.error('[me]', err);
    return send.serverError(res);
  }
}

async function logout(req, res) {
  return send.ok(res, null, 'You have been logged out successfully');
}

module.exports = { signup, login, me, logout };
