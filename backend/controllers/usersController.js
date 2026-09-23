import bcrypt from "bcryptjs";
import {
  findUserById,
  updateUserName,
  findAuthUserById,
  updateUserPassword,
  deleteUserById,
} from "../models/User.js";

export async function updateMe(req, res) {
  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }

  const user = await updateUserName(req.userId, name.trim());
  if (!user) return res.status(404).json({ message: "User not found" });

  return res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

export async function getMe(req, res) {
  const user = await findUserById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  const user = await findAuthUserById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) return res.status(401).json({ message: "Current password is incorrect" });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(req.userId, passwordHash);
  return res.json({ success: true });
}

export async function deleteAccount(req, res) {
  await deleteUserById(req.userId);
  return res.json({ success: true });
}
