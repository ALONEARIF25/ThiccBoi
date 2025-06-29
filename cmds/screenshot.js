import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
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
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const url = interaction.options.getString("url");
    const resolution =
      interaction.options.getString("resolution") ?? "1280/720";

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
  },
};
