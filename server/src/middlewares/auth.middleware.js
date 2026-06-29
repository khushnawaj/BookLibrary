const { HTTP_STATUS, COOKIE_NAMES } = require('../constants');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/jwt.util');
const { User } = require('../models');

const extractAccessToken = (req) => {
  if (req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN]) {
    return req.cookies[COOKIE_NAMES.ACCESS_TOKEN];
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
};

const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractAccessToken(req);

  if (!token) {
    throw new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED);
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new AppError('Invalid or expired access token', HTTP_STATUS.UNAUTHORIZED);
  }

  const user = await User.findById(decoded.userId).select('+refreshToken');

  if (!user) {
    throw new AppError('User no longer exists', HTTP_STATUS.UNAUTHORIZED);
  }

  // Restrict write actions for GUEST role
  if (user.role === 'GUEST' && req.method !== 'GET') {
    throw new AppError('Guest account is read-only. Please register or sign in to perform actions, save books, or interact.', HTTP_STATUS.FORBIDDEN);
  }

  req.user = user;
  req.auth = {
    userId: user._id,
    role: user.role,
  };

  next();
});

const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  const token = extractAccessToken(req);

  if (!token) {
    return next();
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    return next();
  }

  const user = await User.findById(decoded.userId);

  if (user) {
    req.user = user;
    req.auth = {
      userId: user._id,
      role: user.role,
    };
  }

  next();
});

module.exports = { authenticate, optionalAuthenticate, extractAccessToken };

