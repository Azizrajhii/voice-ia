import {
  listAllUsers,
  countAllUsers,
  updateUserRole,
  deleteUserById,
  findUserById,
} from "../models/User.js";
import { countAllMessages, countMessagesToday } from "../models/Message.js";
import { validateRole, assertNotSelf } from "../lib/admin.js";

export async function getOverview(req, res) {
  const [userCount, messageCount, messagesToday] = await Promise.all([
    countAllUsers(),
    countAllMessages(),
    countMessagesToday(),
  ]);
  return res.json({ userCount, messageCount, messagesToday });
}

export async function listUsers(req, res) {
  const users = await listAllUsers();
  return res.json({ users });
}

export async function setRole(req, res) {
  const targetId = Number(req.params.id);

  const { error: selfError } = assertNotSelf(req.userId, targetId);
  if (selfError) return res.status(400).json({ message: selfError });

  const { error: roleError, value: role } = validateRole(req.body?.role);
  if (roleError) return res.status(400).json({ message: roleError });

  const target = await findUserById(targetId);
  if (!target) return res.status(404).json({ message: "User not found" });

  const updated = await updateUserRole(targetId, role);
  return res.json({ user: updated });
}

export async function removeUser(req, res) {
  const targetId = Number(req.params.id);

  const { error: selfError } = assertNotSelf(req.userId, targetId);
  if (selfError) return res.status(400).json({ message: selfError });

  const target = await findUserById(targetId);
  if (!target) return res.status(404).json({ message: "User not found" });

  await deleteUserById(targetId);
  return res.json({ success: true });
}
