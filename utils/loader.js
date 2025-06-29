import { Collection } from "discord.js";
import fs from "fs";
import path from "path";

// Load all commands from the cmds directory
export async function loadCommands() {
  const commands = new Collection();
  const commandsPath = path.join(process.cwd(), "cmds");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = (await import(`file://${filePath}`)).default;

    if ("data" in command && "execute" in command) {
      commands.set(command.data.name, command);
      console.log(`Loaded command: ${command.data.name}`);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }

  return commands;
}

// Load all events from the events directory
export async function loadEvents(client) {
  const eventsPath = path.join(process.cwd(), "events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = (await import(`file://${filePath}`)).default;

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }

    console.log(`Loaded event: ${event.name}`);
  }
}
