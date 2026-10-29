// Admin user model.
// Stores only a bcrypt password hash - never the plain-text password.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Verify a plain-text password against the stored hash.
userSchema.methods.verifyPassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Create a new admin user with a hashed password.
userSchema.statics.createAdmin = async function (username, plainPassword) {
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  return this.create({ username: username.trim().toLowerCase(), passwordHash });
};

module.exports = mongoose.model('User', userSchema);