import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("thicc")
    .setDescription("Sends a random SFW anime picture."),

  async execute(interaction) {
    try {
      // Defer the reply since API call might take a moment
      await interaction.deferReply();

      // Fetch random image from nekosapi.com
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(
        "https://api.nekosapi.com/v4/images/random/file?rating=safe",
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
        .setFooter({ text: "Powered by THICC artists" });

      await interaction.editReply({ embeds: [embed] });
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
