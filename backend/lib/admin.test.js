import { test } from "node:test";
import assert from "node:assert/strict";
import { validateRole, assertNotSelf } from "./admin.js";

test('validateRole accepts "user" and "admin"', () => {
  assert.deepEqual(validateRole("user"), { value: "user" });
  assert.deepEqual(validateRole("admin"), { value: "admin" });
});

test("validateRole rejects anything else", () => {
  assert.match(validateRole("root").error, /must be/);
  assert.match(validateRole(undefined).error, /must be/);
  assert.match(validateRole(123).error, /must be/);
});

test("assertNotSelf rejects when acting on your own id", () => {
  assert.match(assertNotSelf(5, 5).error, /own admin account/);
  assert.match(assertNotSelf("5", 5).error, /own admin account/);
});

test("assertNotSelf allows acting on a different id", () => {
  assert.deepEqual(assertNotSelf(5, 6), { value: true });
});
