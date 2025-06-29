import express from "express";
import path from "path";
import cors from "cors";
import { ActivityType } from "discord.js";

const __dirname = path.resolve();

export function setupAPI(client, commands) {
  const app = express();
  app.use(cors());

  const port = 3000;

  // Server count endpoint
  app.get("/servercount", (_req, res) => {
    res.json({
      servers: client.guilds.cache.size,
    });
  });

  // Main page
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"));
  });

  // Bot status endpoint
  app.get("/botstatus", (_req, res) => {
    if (client.user) {
      const presence = client.user.presence;
      const activity = presence.activities[0];

      res.json({
        status: presence.status || "offline",
        activity: activity
          ? `${
              activity.type === ActivityType.Watching
                ? "Watching"
                : activity.type
            } ${activity.name}`
          : "None",
      });
    } else {
      res.status(500).json({ error: "Bot is not logged in." });
    }
  });

  // Bot profile endpoint
  app.get("/botprofile", (_req, res) => {
    if (client.user) {
      res.json({
        username: client.user.username,
        pfpurl: client.user.displayAvatarURL({ format: "png", size: 128 }),
        verified: client.user.verified,
      });
    } else {
      res.status(500).json({ error: "Bot is not logged in." });
    }
  });

  // All commands endpoint
  app.get("/allcmds", (req, res) => {
    const commandsList = Array.from(commands.values()).map((cmd) => ({
      name: cmd.data.name,
      description: cmd.data.description,
    }));
    res.json({ commands: commandsList });
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  return app;
}
