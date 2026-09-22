import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

let pool;

export function getPool() {
  if (!pool) {
    throw new Error('Database pool is not initialized. Call connectDatabase() first.');
  }
  return pool;
}

export async function connectDatabase() {
  const {
    MYSQL_HOST = 'localhost',
    MYSQL_PORT = '3306',
    MYSQL_USER = 'root',
    MYSQL_PASSWORD = '',
    MYSQL_DATABASE = 'souty',
  } = process.env;

  try {
    pool = mysql.createPool({
      host: MYSQL_HOST,
      port: Number(MYSQL_PORT),
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
    });

    await pool.query('SELECT 1');
    globalThis.__DB_STATUS__ = 'connected';
    console.log(`MySQL connection successful (${MYSQL_DATABASE}@${MYSQL_HOST}:${MYSQL_PORT}).`);
    return pool;
  } catch (error) {
    globalThis.__DB_STATUS__ = 'disconnected';
    console.error('MySQL connection failed:', error.message);
    console.error('Is XAMPP\'s MySQL service running, and does the database from backend/sql/schema.sql exist?');
    return null;
  }
}
