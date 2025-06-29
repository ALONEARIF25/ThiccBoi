import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from "discord.js";
import os from "os";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows all available commands"),

  async execute(interaction, commands) {
    // Create a more visually appealing embed
    const helpEmbed = new EmbedBuilder()
      .setTitle("Command Center")
      .setColor(0xf5d142) // Discord blurple color
      .setTimestamp()
      .setFooter({
        text: "Bot is idle - More commands coming soon!",
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    // Group commands by category or add them as fields
    const commandFields = commands.map((cmd) => ({
      name: `<a:5_blue_flame:884647457450000505>/${cmd.data.name}`,
      value: `${cmd.data.description}`,
      inline: true,
    }));

    // Add command fields to embed (Discord limits to 25 fields)
    commandFields.slice(0, 25).forEach((field) => {
      helpEmbed.addFields(field);
    });

    // Create action buttons
    const helpButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("help_refresh")
        .setLabel("🔄 Refresh")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("help_support")
        .setLabel("❓ Support")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("help_info")
        .setLabel("ℹ️ Bot Info")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setLabel("🔗 Invite Bot")
        .setURL(
          `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`
        )
        .setStyle(ButtonStyle.Link)
    );

    // Send the enhanced help message
    await interaction.reply({
      embeds: [helpEmbed],
      components: [helpButtons],
    });

    // Handle button interactions
    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 300000, // 5 minutes
    });

    collector.on("collect", async (i) => {
      if (i.customId === "help_refresh") {
        // Refresh the help command
        const newEmbed = EmbedBuilder.from(helpEmbed)
          .setTimestamp()
          .setFooter({
            text: `Last updated: ${new Date().toLocaleTimeString()} - More commands coming soon!`,
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        await i.update({
          embeds: [newEmbed],
          components: [helpButtons],
        });
      } else if (i.customId === "help_support") {
        const supportEmbed = new EmbedBuilder()
          .setTitle("🛠️ Need Help?")
          .setDescription(
            "If you need assistance with the bot, here are some ways to get help:"
          )
          .addFields(
            {
              name: "📚 Documentation",
              value: "Check the README.md file for detailed information",
              inline: true,
            },
            {
              name: "🐛 Report Bugs",
              value: "Use `/status` to check bot health",
              inline: true,
            },
            {
              name: "💡 Suggestions",
              value: "Contact the bot developer for feature requests",
              inline: true,
            }
          )
          .setColor(0x00ff00)
          .setTimestamp();

        await i.reply({
          embeds: [supportEmbed],
          flags: MessageFlags.Ephemeral,
        });
      } else if (i.customId === "help_info") {
        // Get system information
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const memoryUsage = process.memoryUsage();
        const cpuCores = os.cpus().length;
        const cpuModel = os.cpus()[0].model;
        const platform = os.platform();
        const nodeVersion = process.version;
        const uptime = os.uptime();

        // Format memory values
        const formatBytes = (bytes) => {
          const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
          if (bytes === 0) return "0 Bytes";
          const i = Math.floor(Math.log(bytes) / Math.log(1024));
          return (
            Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
          );
        };

        // Format uptime
        const formatUptime = (seconds) => {
          const days = Math.floor(seconds / 86400);
          const hours = Math.floor((seconds % 86400) / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          return `${days}d ${hours}h ${minutes}m`;
        };

        const infoEmbed = new EmbedBuilder()
          .setTitle("🤖 Bot Information")
          .setDescription(
            "ThiccBoiBot - A powerful Discord bot with various utilities"
          )
          .addFields(
            {
              name: "📊 Bot Stats",
              value: `**Commands:** ${commands.length}\n**Ping:** ${
                interaction.client.ws.ping
              }ms\n**Bot Uptime:** ${Math.floor(
                interaction.client.uptime / 1000 / 60
              )} minutes`,
              inline: true,
            },
            {
              name: "💾 Memory Usage",
              value: `**Bot RAM:** ${formatBytes(
                memoryUsage.heapUsed
              )} / ${formatBytes(
                memoryUsage.heapTotal
              )}\n**System RAM:** ${formatBytes(usedMemory)} / ${formatBytes(
                totalMemory
              )}\n**Free RAM:** ${formatBytes(freeMemory)}`,
              inline: true,
            },
            {
              name: "🖥️ System Info",
              value: `**OS:** ${
                platform.charAt(0).toUpperCase() + platform.slice(1)
              }\n**CPU Cores:** ${cpuCores}\n**System Uptime:** ${formatUptime(
                uptime
              )}`,
              inline: true,
            },
            {
              name: "⚙️ Technical",
              value: `**Node.js:** ${nodeVersion}\n**Discord.js:** ^14.21.0\n**Architecture:** ${os.arch()}`,
              inline: true,
            },
            {
              name: "💻 CPU Model",
              value: `${
                cpuModel.length > 45
                  ? cpuModel.substring(0, 45) + "..."
                  : cpuModel
              }`,
              inline: true,
            },
            {
              name: "👨‍💻 Developer",
              value:
                "[ALONE](https://discord.com/users/alonearif)\n**Bot ID:** " +
                interaction.client.user.id,
              inline: true,
            }
          )
          .setColor(0xff6b6b)
          .setThumbnail(interaction.client.user.displayAvatarURL())
          .setTimestamp();

        await i.reply({
          embeds: [infoEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }
    });

    collector.on("end", () => {
      // Disable buttons after collector ends
      const disabledButtons = new ActionRowBuilder().addComponents(
        ButtonBuilder.from(helpButtons.components[0]).setDisabled(true),
        ButtonBuilder.from(helpButtons.components[1]).setDisabled(true),
        ButtonBuilder.from(helpButtons.components[2]).setDisabled(true),
        ButtonBuilder.from(helpButtons.components[3])
      );

      interaction
        .editReply({
          components: [disabledButtons],
        })
        .catch(() => {}); // Ignore errors if message was deleted
    });
  },
};
