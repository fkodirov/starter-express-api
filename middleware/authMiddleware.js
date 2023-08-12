const apiError = require("../exceptions/api-error");
const jwt = require("jsonwebtoken");
const tokenService = require("../service/token-service");
module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    return next(apiError.UnauthorizedError());
  }
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(apiError.UnauthorizedError());
    }
    const accessToken = req.headers.authorization.split(" ")[1];
    if (!accessToken) {
      return next(apiError.UnauthorizedError());
    }
    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(apiError.UnauthorizedError());
    }
    req.user = userData;
    next();
  } catch (error) {
    return next(apiError.UnauthorizedError());
  }
};
