const mysql = require("mysql2/promise");
require("dotenv").config();

let poolConfig;

// Railway provides a full DATABASE_URL — use it if available
if (process.env.DATABASE_URL) {
  poolConfig = {
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
  };
} else {
  poolConfig = {
    host:     process.env.DB_HOST     || "localhost",
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME     || "takipsilim_cafe",
    port:     parseInt(process.env.DB_PORT || "3306"),
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    waitForConnections: true,
    connectionLimit: 10,
  };
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;
