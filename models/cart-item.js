const Sequelize = require("sequelize");
const sequelize = require("../helpers/database");


const CartItem = sequelize.define("cartItem", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER
    }

});

module.exports = CartItem;