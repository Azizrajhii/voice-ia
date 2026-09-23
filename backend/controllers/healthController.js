export function getHealth(req, res) {
  res.json({
    status: "ok",
    service: "voice-ia-backend",
    database: globalThis.__DB_STATUS__ || "not-configured",
    timestamp: new Date().toISOString(),
  });
}

export function getApiInfo(req, res) {
  res.json({
    message: "Backend API is ready",
    database: globalThis.__DB_STATUS__ || "not-configured",
  });
}
