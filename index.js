import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
} from "discord.js";
import "dotenv/config";
import { loadCommands, loadEvents } from "./utils/loader.js";
import { setupAPI } from "./api/server.js";

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Initialize commands collection
client.commands = new Collection();

async function startBot() {
  try {
    // Load commands
    console.log("Loading commands...");
    const commands = await loadCommands();
    client.commands = commands;

    // Load events
    console.log("Loading events...");
    await loadEvents(client);

    // Register slash commands with Discord
    console.log("Started refreshing application (/) commands.");
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    const commandData = Array.from(commands.values()).map((command) =>
      command.data.toJSON()
    );

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commandData,
    });

    console.log("Successfully reloaded application (/) commands.");
    console.log(`Registered ${commandData.length} commands in total.`);

    // Setup API server
    console.log("Setting up API server...");
    setupAPI(client, commands);

    // Login to Discord
    await client.login(process.env.TOKEN);
  } catch (error) {
    console.error("Error starting bot:", error);
  }
}

// Start the bot
startBot();
