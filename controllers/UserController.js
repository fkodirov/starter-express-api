const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserService = require("../service/user-service");
const connection = require("../dbconnect/dbconnect");
const User = require("../models/User");
const userService = require("../service/user-service");

class UserController {
  async registration(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const userData = await userService.registration(name, email, password);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 20 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json({ ...userData });
      // res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
      next(error);
    }
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 20 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json({ ...userData });
    } catch (error) {
      next(error);
    }
  }
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.json(token);
    } catch (error) {
      next(error);
    }
  }
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 20 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json({ ...userData });
    } catch (error) {
      next(error);
    }
  }
  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
  async getUser(req, res, next) {
    try {
      const id = +req.params.id;
      const user = await userService.getUser(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
  async deleteUsers(req, res, next) {
    try {
      const userId = +req.params.id;
      await userService.deleteUsers(userId);
      res.json({ message: "User deleted." });
    } catch (error) {
      next(error);
    }
  }
  async updateUsers(req, res, next) {
    try {
      const { status } = req.body;
      const userId = +req.params.id;
      await userService.updateUsers(userId, status);
      res.json({ message: "User updated." });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
