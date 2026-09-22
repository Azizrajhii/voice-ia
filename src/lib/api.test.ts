import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  askSouty,
  clearToken,
  getCurrentUser,
  getToken,
  loginAccount,
  setToken,
} from "./api";

function mockFetchOnce(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe("token storage", () => {
  afterEach(() => localStorage.clear());

  it("round-trips a token through localStorage", () => {
    expect(getToken()).toBeNull();
    setToken("abc123");
    expect(getToken()).toBe("abc123");
    clearToken();
    expect(getToken()).toBeNull();
  });
});

describe("request()", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not attach an Authorization header when no token is stored", async () => {
    const fetchMock = mockFetchOnce(200, { token: "t", user: { id: 1 } });
    vi.stubGlobal("fetch", fetchMock);

    await loginAccount("a@b.com", "secret123");

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.headers["Authorization"]).toBeUndefined();
  });

  it("attaches a Bearer token on authenticated requests", async () => {
    setToken("my-jwt");
    const fetchMock = mockFetchOnce(200, { user: { id: 1, name: "Aziz" } });
    vi.stubGlobal("fetch", fetchMock);

    await getCurrentUser();

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/users/me");
    expect(init.headers["Authorization"]).toBe("Bearer my-jwt");
  });

  it("throws the server's error message on a non-ok response", async () => {
    const fetchMock = mockFetchOnce(401, { message: "Invalid email or password" });
    vi.stubGlobal("fetch", fetchMock);

    await expect(loginAccount("a@b.com", "wrong")).rejects.toThrow("Invalid email or password");
  });

  it("falls back to a generic error when the server sends no message", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(loginAccount("a@b.com", "x")).rejects.toThrow("Request failed: 500");
  });

  it("sends the chat payload as JSON on askSouty", async () => {
    setToken("my-jwt");
    const fetchMock = mockFetchOnce(200, { reply: "Ahla!" });
    vi.stubGlobal("fetch", fetchMock);

    const result = await askSouty("chnowa ahwelek", "derja", []);

    expect(result.reply).toBe("Ahla!");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/chat");
    expect(JSON.parse(init.body)).toEqual({
      transcript: "chnowa ahwelek",
      language: "derja",
      history: [],
    });
  });
});
