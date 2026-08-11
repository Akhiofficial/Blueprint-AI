import User from '../models/User.js';

/**
 * Registers a new user if the email is not already taken.
 * @param {Object} userData - User registration details
 * @param {string} userData.name
 * @param {string} userData.email
 * @param {string} userData.password
 * @returns {Promise<Object>} The created User model instance
 */
export const register = async ({ name, email, password }) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('Email already in use');
  }

  return await User.create({ name, email, password });
};

/**
 * Authenticates a user by matching email and password.
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<Object>} The authenticated User model instance
 */
export const login = async ({ email, password }) => {
  // Explicitly select password since it has select:false in the schema
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return user;
};
