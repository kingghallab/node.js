
/**
 * @type {import('sequelize').Sequelize}
 */



const Sequelize = require("sequelize");

const sequelize = new Sequelize("node-complete", "root", "kingman5", {
    dialect: "mysql",
    host: "localhost"
});

/**
 * @type {import('sequelize').Model}
 */

module.exports = sequelize;
