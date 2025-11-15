export const sendResponse = (message, data, status = 200) => ({
  success: true,
  message,
  data,
  status,
});

export const sendError = (message, errors = {}, status = 400) => ({
  success: false,
  message,
  errors,
  status,
});