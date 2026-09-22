export const ROLES = new Set(['user', 'admin']);

export function validateRole(role) {
  if (typeof role !== 'string' || !ROLES.has(role)) {
    return { error: 'role must be "user" or "admin"' };
  }
  return { value: role };
}

// An admin must never be able to demote or delete themself through the
// admin panel — that's how you accidentally lock every admin out.
export function assertNotSelf(actingUserId, targetUserId) {
  if (Number(actingUserId) === Number(targetUserId)) {
    return { error: "You can't change your own admin account from here." };
  }
  return { value: true };
}
