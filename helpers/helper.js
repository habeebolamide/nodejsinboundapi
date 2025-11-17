export const sendResponse = (message, data) => ({
  success: true,
  message,
  data,
});

export const sendError = (message, errors = {}) => ({
  success: false,
  message,
  errors,
});