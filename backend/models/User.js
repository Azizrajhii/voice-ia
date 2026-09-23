import { getPool } from "../config/db.js";

export async function findUserByEmail(email) {
  const [rows] = await getPool().query(
    "SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ? LIMIT 1",
    [email],
  );
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const [rows] = await getPool().query(
    "SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] ?? null;
}

export async function createUser({ name, email, passwordHash, role = "user" }) {
  const [result] = await getPool().query(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [name, email, passwordHash, role],
  );
  return findUserById(result.insertId);
}

export async function updateUserName(id, name) {
  await getPool().query("UPDATE users SET name = ? WHERE id = ?", [name, id]);
  return findUserById(id);
}

export async function findAuthUserById(id) {
  const [rows] = await getPool().query(
    "SELECT id, name, email, password_hash, role FROM users WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] ?? null;
}

export async function updateUserPassword(id, passwordHash) {
  await getPool().query("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
}

export async function deleteUserById(id) {
  await getPool().query("DELETE FROM users WHERE id = ?", [id]);
}

export async function listAllUsers() {
  const [rows] = await getPool().query(
    `SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
            COUNT(m.id) AS message_count
     FROM users u
     LEFT JOIN messages m ON m.user_id = u.id
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
  );
  return rows;
}

export async function countAllUsers() {
  const [rows] = await getPool().query("SELECT COUNT(*) AS count FROM users");
  return rows[0]?.count ?? 0;
}

export async function updateUserRole(id, role) {
  await getPool().query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
  return findUserById(id);
}
