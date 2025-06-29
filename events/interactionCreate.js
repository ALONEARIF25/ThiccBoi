import { Events, Collection, MessageFlags } from "discord.js";
import fs from "fs";
import path from "path";

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      // Special case for help command to pass all commands
      if (interaction.commandName === "help") {
        await command.execute(
          interaction,
          Array.from(client.commands.values())
        );
      } else {
        await command.execute(interaction);
      }
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);

      const errorMessage = "There was an error while executing this command!";

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: errorMessage,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: errorMessage,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
