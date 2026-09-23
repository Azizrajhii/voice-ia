import {
  countMessagesByUser,
  listMessagesByUser,
  deleteMessagesByUser,
} from "../models/Message.js";

export async function getStats(req, res) {
  const count = await countMessagesByUser(req.userId);
  return res.json({ count });
}

export async function listMine(req, res) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const messages = await listMessagesByUser(req.userId, { limit, offset });
  return res.json({ messages });
}

export async function clearMine(req, res) {
  await deleteMessagesByUser(req.userId);
  return res.json({ success: true });
}
