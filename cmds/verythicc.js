import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("verythicc")
    .setDescription("Sends a random NSFW anime picture."),

  async execute(interaction) {
    try {
      // Check if the channel is NSFW
      if (!interaction.channel.nsfw) {
        const nsfwEmbed = new EmbedBuilder()
          .setTitle("NSFW Channel Required")
          .setDescription("This command can only be used in NSFW channels!")
          .setColor(0xff0000);

        await interaction.reply({ embeds: [nsfwEmbed], ephemeral: true });
        return;
      }

      // Defer the reply since API call might take a moment
      await interaction.deferReply();

      // Fetch random NSFW image from nekosapi.com with explicit rating
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(
        "https://api.nekosapi.com/v4/images/random/file?rating=explicit",
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "ThiccBoiBot/1.0",
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      // The API returns the image file directly, so we use the response URL
      const imageUrl = response.url;

      // Create embed with the image
      const embed = new EmbedBuilder()
        .setImage(imageUrl)
        .setColor(0xba34eb)
        .setFooter({
          text: "NSFW Content",
          iconURL: "https://cdn.discordapp.com/emojis/922789307998142474.gif",
        });

      // Create delete button
      const deleteButton = new ButtonBuilder()
        .setCustomId("delete_image")
        .setLabel("🗑️ Delete")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(deleteButton);

      const message = await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      // Create collector for button interactions
      const collector = message.createMessageComponentCollector({
        time: 60000, // 1 minute timeout
      });

      collector.on("collect", async (buttonInteraction) => {
        if (buttonInteraction.customId === "delete_image") {
          // Check if the button clicker is the original command user
          if (buttonInteraction.user.id !== interaction.user.id) {
            await buttonInteraction.reply({
              content:
                "Only the person who used the command can delete this message!",
              ephemeral: true,
            });
            return;
          }

          // Update button to show countdown
          let countdown = 3;
          const updateButton = () => {
            const countdownButton = new ButtonBuilder()
              .setCustomId("delete_countdown")
              .setLabel(`🗑️ Deleting in ${countdown}s`)
              .setStyle(ButtonStyle.Danger)
              .setDisabled(true);

            const newRow = new ActionRowBuilder().addComponents(
              countdownButton
            );
            return newRow;
          };

          // Initial button update
          await buttonInteraction.update({
            embeds: [embed],
            components: [updateButton()],
          });

          // Countdown interval
          const countdownInterval = setInterval(async () => {
            countdown--;
            if (countdown > 0) {
              try {
                await message.edit({
                  embeds: [embed],
                  components: [updateButton()],
                });
              } catch (error) {
                console.error("Error updating countdown:", error);
                clearInterval(countdownInterval);
              }
            } else {
              clearInterval(countdownInterval);
              try {
                await message.delete();
              } catch (error) {
                console.error("Error deleting message:", error);
              }
            }
          }, 1000);
        }
      });

      collector.on("end", async () => {
        try {
          // Remove the button after collector expires
          await message.edit({ embeds: [embed], components: [] });
        } catch (error) {
          console.error("Error removing button:", error);
        }
      });
    } catch (error) {
      console.error("Error fetching image from nekosapi:", error);

      let errorMessage =
        "Sorry, I couldn't fetch an image right now. Please try again later!";

      if (
        error.name === "AbortError" ||
        error.code === "UND_ERR_CONNECT_TIMEOUT"
      ) {
        errorMessage =
          "Connection timeout - the API might be slow or unavailable. Please try again in a moment!";
      } else if (error.message.includes("status: 429")) {
        errorMessage =
          "Rate limit exceeded. Please wait a moment before trying again!";
      } else if (
        error.message.includes("status: 503") ||
        error.message.includes("status: 502")
      ) {
        errorMessage =
          "The API is temporarily unavailable. Please try again later!";
      }

      const errorEmbed = new EmbedBuilder()
        .setTitle("⚠️ Connection Error")
        .setDescription(errorMessage)
        .setColor(0xff0000)
        .setFooter({
          text: "If this persists, the API might be experiencing issues.",
        });

      if (interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        await interaction.reply({ embeds: [errorEmbed] });
      }
    }
  },
};
