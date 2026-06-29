const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES } = require('../constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLES),
        message: 'Invalid role',
      },
      default: USER_ROLES.USER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    booksRead: {
      type: Number,
      default: 0,
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

userSchema.index({ role: 1 });

userSchema.virtual('displayName').get(function displayName() {
  return this.name;
});

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicProfile = function toPublicProfile() {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    bannerImage: this.bannerImage,
    bio: this.bio,
    role: this.role,
    isVerified: this.isVerified,
    booksRead: this.booksRead,
    followersCount: this.followersCount,
    followingCount: this.followingCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

userSchema.index({ name: 'text', username: 'text', email: 'text' });

const User = mongoose.model('User', userSchema);

module.exports = User;
