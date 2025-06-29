import {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ActivityType,
} from "discord.js";
import "dotenv/config";
import fs from "fs";
import express from "express";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});
// Create slash command
const commands = [
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check if bot is online")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows all available commands")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("thicc")
    .setDescription("Sends a SFW anime picture")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("screenshot")
    .setDescription("Takes a screenshot of a website")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("The URL to screenshot")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("resolution")
        .setDescription("Resolution (e.g. 1080p, 720p)")
        .setRequired(false)
        .addChoices(
          { name: "720p", value: "1280/720" },
          { name: "1080p", value: "1920/1080" }
        )
    )
    .toJSON(),
];

// Add screenshot command handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (
    !interaction.isChatInputCommand() ||
    interaction.commandName !== "screenshot"
  )
    return;

  await interaction.deferReply();
  const url = interaction.options.getString("url");
  const resolution = interaction.options.getString("resolution") ?? "1280/720";

  const site = /^(https?:\/\/)/i.test(url) ? url : `https://${url}`;
  const [width, height] = resolution.split("/");

  try {
    const screenshotUrl = `https://image.thum.io/get/width/${width}/crop/${height}/noanimate/${site}`;
    const response = await fetch(screenshotUrl);

    if (!response.ok) throw new Error("Failed to capture screenshot");

    const imageBuffer = await response.arrayBuffer();

    await interaction.editReply({
      files: [
        {
          attachment: Buffer.from(imageBuffer),
          name: "screenshot.png",
        },
      ],
      content: `\`\`\`${site}\`\`\``,
    });
  } catch (error) {
    console.log(error.message);
    await interaction.editReply(
      "Failed to capture screenshot. Please check the URL and try again."
    );
  }
});

// Read thicc.json file initially
let thiccData;
try {
  thiccData = JSON.parse(fs.readFileSync("thicc.json", "utf8"));
} catch (error) {
  console.error("Failed to load thicc.json:", error.message);
  thiccData = { images: [] }; // Default fallback
}

// Watch thicc.json file for changes
fs.watchFile("thicc.json", (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    console.log("thicc.json file has been updated.");
    try {
      thiccData = JSON.parse(fs.readFileSync("thicc.json", "utf8"));
    } catch (error) {
      console.error("Failed to reload thicc.json:", error.message);
    }
  }
});

// Add thicc command handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "thicc") {
    // Validate thiccData and get a random image
    if (thiccData?.images?.length) {
      const randomImage =
        thiccData.images[Math.floor(Math.random() * thiccData.images.length)];
      await interaction.reply({
        embeds: [
          {
            title: randomImage.name || "Random Image",
            image: {
              url: randomImage.url || "https://via.placeholder.com/300",
            },
          },
        ],
      });
    } else {
      await interaction.reply(
        "No images are available in the `thicc.json` file!"
      );
    }
  }
});

// Register slash commands
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

try {
  console.log("Started refreshing application (/) commands.");

  // Log each command name as it's being registered
  commands.forEach((cmd) => {
    console.log(`Registering command: ${cmd.name}`);
  });

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: commands,
  });

  console.log("Successfully reloaded application (/) commands.");
  console.log(`Registered ${commands.length} commands in total.`);
} catch (error) {
  console.error(error);
}

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "status") {
    await interaction.reply("Bot is online! 🟢");
  }
});
// Add help command to commands array

// Add help command handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "help") {
    const commandList = commands
      .map((cmd) => `| /${cmd.name} | ${cmd.description} |`)
      .join("\n");
    const tableHeader = "| Command | Description |\n|----------|-------------|";

    await interaction.reply({
      embeds: [
        {
          title: "Available Commands",
          description: `${tableHeader}\n${commandList}`,
          footer: {
            text: "Bot is being re-developed since 21 Nov, so commands will be added slowly.",
          },
        },
      ],
    });
  }
});

// When client is ready
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);

  // Set the bot's presence
  c.user.setPresence({
    status: "online", // Options: "online", "idle", "dnd", "invisible"
    activities: [
      {
        name: "Thicc Bois", // Status message
        type: ActivityType.Watching, // Type of activity
      },
    ],
  });
});

// Add wiki command handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "wiki") {
    await interaction.deferReply();
    const keyword = interaction.options.getString("keyword");

    try {
      const page = await wiki.summary(keyword);
      await interaction.editReply({
        content: page.extract.substring(0, 1500) + "...",
      });
    } catch (error) {
      await interaction.editReply("No results found.");
    }
  }
});

// Log the number of servers the bot is in
client.once(Events.ClientReady, () => {
  console.log(`Bot is in ${client.guilds.cache.size} servers`);
});

// Login to Discord with token
client.login(process.env.TOKEN);

import path from "path";
import cors from "cors";
const app = express();
app.use(cors());

const port = 3000;

const __dirname = path.resolve();

app.get("/servercount", (_req, res) => {
  res.json({
    servers: client.guilds.cache.size,
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get("/botstatus", (_req, res) => {
  if (client.user) {
    const presence = client.user.presence;
    const activity = presence.activities[0];

    res.json({
      status: presence.status || "offline",
      activity: activity
        ? `${
            activity.type === ActivityType.Watching ? "Watching" : activity.type
          } ${activity.name}`
        : "None",
    });
  } else {
    res.status(500).json({ error: "Bot is not logged in." });
  }
});

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

app.get("/allcmds", (req, res) => {
  const commandsList = commands.map((cmd) => ({
    name: cmd.name,
    description: cmd.description,
  }));
  res.json({ commands: commandsList });
});
