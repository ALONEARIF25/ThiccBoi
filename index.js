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
];

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
commands.push(
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows all available commands")
    .toJSON()
);

// Add help command handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "help") {
    await interaction.reply({
      embeds: [
        {
          title: "Help",
          description: "All commands:\n/help\n/status",
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
    status: "idle", // Options: "online", "idle", "dnd", "invisible"
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
