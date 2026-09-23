import { getPool } from "../config/db.js";

export async function createMessage({ userId, transcript, reply, language }) {
  await getPool().query(
    "INSERT INTO messages (user_id, transcript, reply, language) VALUES (?, ?, ?, ?)",
    [userId, transcript, reply, language],
  );
}

export async function countMessagesByUser(userId) {
  const [rows] = await getPool().query("SELECT COUNT(*) AS count FROM messages WHERE user_id = ?", [
    userId,
  ]);
  return rows[0]?.count ?? 0;
}

export async function listMessagesByUser(userId, { limit = 20, offset = 0 } = {}) {
  const [rows] = await getPool().query(
    "SELECT id, transcript, reply, language, created_at FROM messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [userId, limit, offset],
  );
  return rows;
}

export async function deleteMessagesByUser(userId) {
  await getPool().query("DELETE FROM messages WHERE user_id = ?", [userId]);
}

export async function countAllMessages() {
  const [rows] = await getPool().query("SELECT COUNT(*) AS count FROM messages");
  return rows[0]?.count ?? 0;
}

export async function countMessagesToday() {
  const [rows] = await getPool().query(
    "SELECT COUNT(*) AS count FROM messages WHERE DATE(created_at) = CURDATE()",
  );
  return rows[0]?.count ?? 0;
}
