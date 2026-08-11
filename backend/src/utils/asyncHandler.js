/**
 * Wraps an async express route handler and forwards any thrown errors
 * to Express's centralized error middleware via next(err).
 * Eliminates repetitive try/catch blocks in controllers.
 *
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
