const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), override: true });
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const readEnv = (key, fallback = "") => {
  const value = process.env[key];
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return fallback;
};

const PORT = parseInt(readEnv("PORT"), 10);
const HOST = readEnv("HOST");
const DB_USERNAME = readEnv("DB_USERNAME");
const DB_PASSWORD = readEnv("DB_PASSWORD");
const DB_DATABASE = readEnv("DB_DATABASE");
const DB_PORT = parseInt(readEnv("DB_PORT"), 10);
const DATABASE_URL = readEnv("DATABASE_URL") || `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${HOST}:${DB_PORT}/${DB_DATABASE}?schema=public`;

const ACCESS_TOKEN_SECRET = readEnv("ACCESS_TOKEN_SECRET");
const JWT_SECRET = readEnv("JWT_SECRET", ACCESS_TOKEN_SECRET);
const cookieKey = readEnv("cookieKey");
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

module.exports = {
  PORT,
  HOST,
  DB_USERNAME,
  DB_PORT,
  DB_PASSWORD,
  DB_DATABASE,
  DATABASE_URL,
  ACCESS_TOKEN_SECRET,
  JWT_SECRET,
  cookieKey,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS
};