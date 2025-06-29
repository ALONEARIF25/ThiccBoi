import { Events, ActivityType } from "discord.js";

export default {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    console.log(`Bot is in ${client.guilds.cache.size} servers`);

    // Set the bot's presence
    client.user.setPresence({
      status: "online", // Options: "online", "idle", "dnd", "invisible"
      activities: [
        {
          name: "Thicc Bois", // Status message
          type: ActivityType.Watching, // Type of activity
        },
      ],
    });
  },
};
