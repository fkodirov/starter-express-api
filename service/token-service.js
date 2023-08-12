require("dotenv").config();
const tokenModel = require("../models/Token");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("sequelize");

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "15d",
    });
    return { accessToken, refreshToken };
  }

  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return userData;
    } catch (error) {
      return null;
    }
  }

  validateRefrshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (error) {
      return null;
    }
  }

  async saveToken(userId, refreshToken) {
    let tokenData = await tokenModel.findOne({ where: { userId } });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      await tokenData.save();
    } else {
      tokenData = await tokenModel.create({ userId, refreshToken });
    }

    return tokenData;
  }
  async removeToken(identifier) {
    const arg = isNaN(identifier)
      ? { refreshToken: identifier }
      : { userId: identifier };
    await tokenModel.destroy({
      where: arg,
    });
    return { userId: identifier };
  }

  async findToken(refreshToken) {
    const tokenData = await tokenModel.findOne({
      where: { refreshToken },
    });
    return tokenData;
  }
}

module.exports = new TokenService();
