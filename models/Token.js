const { DataTypes, Model } = require("sequelize");
const sequelize = require("../dbconnect/dbconnect");
const User = require("./User");

class Token extends Model {}

Token.init(
  {
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Token",
    tableName: "token",
    timestamps: false,
  }
);
Token.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
});

module.exports = Token;
