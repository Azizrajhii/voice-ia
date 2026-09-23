import express from "express";
import cors from "cors";
import net from "node:net";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { connectDatabase } from "./config/db.js";

dotenv.config();

const app = express();

function getAvailablePort(port) {
  return new Promise((resolve, reject) => {
    const tester = net.createServer();

    tester.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(getAvailablePort(port + 1));
        return;
      }

      reject(error);
    });

    tester.once("listening", () => {
      const address = tester.address();
      tester.close(() => resolve(address.port));
    });

    tester.listen(port, "0.0.0.0");
  });
}

app.use(cors());
app.use(express.json());
app.use("/api", routes);

async function startServer() {
  await connectDatabase();

  const PORT = await getAvailablePort(Number(process.env.PORT || 4005));

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`Database status: ${globalThis.__DB_STATUS__ || "not-configured"}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
