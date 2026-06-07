const { HTTP_STATUS } = require('../constants');
const AppError = require('../utils/AppError');
const { User } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/jwt.util');
const { hashToken } = require('../utils/tokenHash.util');

const buildTokenPayload = (user) => ({
  userId: user._id.toString(),
  role: user.role,
});

const issueAuthTokens = async (user) => {
  const payload = buildTokenPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken, user };
};

const registerUser = async ({ name, username, email, password }) => {
  const existingUser = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  }).select('+password');

  if (existingUser) {
    if (existingUser.email === email) {
      throw new AppError('Email is already registered', HTTP_STATUS.CONFLICT);
    }
    throw new AppError('Username is already taken', HTTP_STATUS.CONFLICT);
  }

  const user = await User.create({
    name,
    username: username.toLowerCase(),
    email,
    password,
  });

  return issueAuthTokens(user);
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  return issueAuthTokens(user);
};

const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  return user.toPublicProfile();
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  issueAuthTokens,
};
