import { Events, Collection, MessageFlags } from "discord.js";
import fs from "fs";
import path from "path";
import {
  handleCastButton,
  handleBackButton,
  handleCastNavigation,
  handleCoverButton,
} from "../utils/castHandler.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
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
    }

    // Handle button interactions
    else if (interaction.isButton()) {
      try {
        if (interaction.customId.startsWith("cast_")) {
          if (
            interaction.customId.includes("_prev_") ||
            interaction.customId.includes("_next_")
          ) {
            await handleCastNavigation(interaction);
          } else {
            await handleCastButton(interaction);
          }
        } else if (interaction.customId.startsWith("back_")) {
          await handleBackButton(interaction);
        } else if (interaction.customId.startsWith("cover_")) {
          await handleCoverButton(interaction);
        }
        // Add other button handlers here as needed
      } catch (error) {
        console.error(`Error handling button interaction:`, error);

        const errorMessage = "There was an error while processing this button!";

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
    }
  },
};
