const { COOKIE_NAMES } = require('../constants');

const parseDuration = (duration, fallbackMs) => {
  if (!duration) return fallbackMs;

  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return fallbackMs;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * multipliers[unit];
};

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Cookie security strategy:
 * - Development: sameSite=lax, secure=false  (works on localhost http)
 * - Production (same domain): sameSite=strict, secure=true
 * - Production (cross domain): sameSite=none, secure=true
 *
 * Set COOKIE_SAME_SITE=none in your production .env if frontend & backend
 * are on different domains (e.g. Vercel + Render).
 */
const getSameSite = () => {
  if (!isProduction) return 'lax';
  return process.env.COOKIE_SAME_SITE || 'strict';
};

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: getSameSite(),
  path: '/',
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...baseCookieOptions,
    maxAge: parseDuration(process.env.JWT_ACCESS_EXPIRES_IN, 15 * 60 * 1000),
  });

  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    ...baseCookieOptions,
    maxAge: parseDuration(process.env.JWT_REFRESH_EXPIRES_IN, 7 * 86_400_000),
  });
};

const clearTokenCookies = (res) => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, baseCookieOptions);
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, baseCookieOptions);
};

module.exports = { setTokenCookies, clearTokenCookies };
