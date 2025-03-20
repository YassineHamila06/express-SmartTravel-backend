const { constants } = require("../../constants");

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && Object.values(constants).includes(res.statusCode)
    ? res.statusCode
    : constants.SERVER_ERROR;

  res.status(statusCode).json({
    title: getErrorTitle(statusCode),
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

// Function to map error status codes to titles
const getErrorTitle = (statusCode) => {
  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      return "Validation Failed";
    case constants.NOT_FOUND:
      return "Not Found";
    case constants.UNAUTHORIZED:
      return "Unauthorized";
    case constants.FORBIDDEN:
      return "Forbidden";
    case constants.SERVER_ERROR:
      return "Server Error";
    default:
      return "Error";
  }
};

module.exports = errorHandler;
