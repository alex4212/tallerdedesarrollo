require('dotenv').config({ override: true });

const readEnv = (key, fallback = "") => {
  const value = process.env[key];
  if (typeof value === "string") return value.trim();
  return fallback;
};

const PORT = parseInt(readEnv("PORT", "3000"), 10);
const HOST = readEnv("HOST", "localhost");
const DB_USERNAME = readEnv("DB_USERNAME", "ale");
const PASSWORD = readEnv("PASSWORD", "12345");
const DATABASE = readEnv("DATABASE", "proyectotaller");
const DB_PORT = parseInt(readEnv("DB_PORT", "5432"), 10);
const DATABASE_URL = readEnv("DATABASE_URL", `postgresql://${DB_USERNAME}:${PASSWORD}@${HOST}:${DB_PORT}/${DATABASE}?schema=public`);
const ACCESS_TOKEN_SECRET = readEnv("ACCESS_TOKEN_SECRET", "dev-access-token-secret");
const JWT_SECRET = readEnv("JWT_SECRET", ACCESS_TOKEN_SECRET);
const cookieKey = readEnv("cookieKey", "dev-cookie-key");
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

module.exports = {
  PORT,
  HOST,
  DB_USERNAME,
  DB_PORT,
  PASSWORD,
  DATABASE,
  DATABASE_URL,
  ACCESS_TOKEN_SECRET,
  JWT_SECRET,
  cookieKey,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS
};
