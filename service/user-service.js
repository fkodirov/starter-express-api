const userModel = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenService = require("./token-service");
const apiError = require("../exceptions/api-error");
const EMAIL_REGEXP =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
function validateEmail(value) {
  return EMAIL_REGEXP.test(value);
}
class UserService {
  async registration(name, email, password) {
    const candidate = await userModel.findOne({ where: { email: email } });
    if (candidate) {
      throw apiError.BadRequest("A user with the same email already exists");
    }
    if (name === "") {
      throw apiError.BadRequest("The user name must not be empty.");
    }

    if (!validateEmail(email)) {
      throw apiError.BadRequest("Invalid email address");
    }
    if (password === "") {
      throw apiError.BadRequest("The password must not be empty.");
    }
    const saltRounds = 8;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await userModel.create({
      name: name,
      email: email,
      password: hashedPassword,
    });
    const tokens = tokenService.generateTokens({
      user: newUser.id,
      email: newUser.email,
    });
    await tokenService.saveToken(newUser.id, tokens.refreshToken);
    return {
      ...tokens,
      user: { id: newUser.id, email: newUser.email },
    };
  }

  async login(email, password) {
    const user = await userModel.findOne({ where: { email: email } });
    if (!user) {
      throw apiError.BadRequest("User not found");
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw apiError.BadRequest("Incorrect Password");
    }
    if (user.status === "blocked") {
      throw apiError.BadRequest("User blocked!");
    }
    const tokens = tokenService.generateTokens({
      user: user.id,
      email: user.email,
    });
    await tokenService.saveToken(user.id, tokens.refreshToken);
    user.lastLoginDate = new Date();
    await user.save();
    return {
      ...tokens,
      user: { id: user.id, email: user.email },
    };
  }
  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw apiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefrshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw apiError.UnauthorizedError();
    }
    const user = await userModel.findOne({ where: { id: tokenFromDb.userId } });
    const tokens = tokenService.generateTokens({
      user: user.id,
      email: user.email,
    });
    await tokenService.saveToken(user.id, tokens.refreshToken);
    return {
      ...tokens,
      user: { id: user.id, email: user.email },
    };
  }

  async getAllUsers() {
    const users = await userModel.findAll({
      attributes: { exclude: ["password"] },
    });
    return users;
  }
  async getUser(id) {
    const user = await userModel.findOne({
      where: { id },
      attributes: { exclude: ["password"] },
    });
    return user;
  }
  async deleteUsers(id) {
    await userModel.destroy({
      where: { id },
      attributes: { exclude: ["password"] },
    });
    await tokenService.removeToken(id);
  }
  async updateUsers(id, status) {
    const user = await userModel.findOne({
      where: { id },
      attributes: { exclude: ["password"] },
    });
    user.status = status;
    await user.save();
  }
}

module.exports = new UserService();
