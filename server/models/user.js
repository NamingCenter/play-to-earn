//server/medels/user.js
const Sequelize = require("sequelize");

/* 사용자 정보 DB */
module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        address: {
          type: Sequelize.STRING(200),
          allowNull: false,
          unique: true,
        },
        nick: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        img: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "User",
        tableName: "users",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    // db.User.hasMany(db.Nfts, { foreignKey: "userId", sourceKey: "address" });
    // db.User.belongsToMany(db.Nfts, { through: "Likes", as: "Likers" }); // 좋아요
    // db.User.hasMany(db.Nfts, { foreignKey: "tokenId", sourceKey: "tokenId" });
  }
};
