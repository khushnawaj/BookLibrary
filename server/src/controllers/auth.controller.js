const { HTTP_STATUS } = require('../constants');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { setTokenCookies, clearTokenCookies } = require('../utils/cookie.util');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.registerUser(req.body);

  setTokenCookies(res, accessToken, refreshToken);

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Account created successfully',
    data: { user: user.toPublicProfile() },
  });
});

const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.loginUser(req.body);

  setTokenCookies(res, accessToken, refreshToken);

  return ApiResponse.success(res, {
    message: 'Logged in successfully',
    data: { user: user.toPublicProfile() },
  });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);
  clearTokenCookies(res);

  return ApiResponse.success(res, {
    message: 'Logged out successfully',
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  return ApiResponse.success(res, {
    message: 'User profile retrieved',
    data: { user },
  });
});

module.exports = { register, login, logout, getMe };
