# ThiccBoiBot - Modular Discord Bot

A Discord bot built with Discord.js v14 featuring a modular command system and web API.

## Project Structure

```
ThiccBoiBot/
├── cmds/                 # Command files
│   ├── _template.js      # Command template for reference
│   ├── help.js          # Help command
│   ├── screenshot.js    # Screenshot command
│   ├── status.js        # Status command
│   └── thicc.js         # Thicc anime images command
├── events/              # Event handlers
│   ├── interactionCreate.js  # Command interaction handler
│   └── ready.js         # Bot ready event
├── api/                 # Web API routes
│   └── server.js        # Express server setup
├── utils/               # Utility functions
│   └── loader.js        # Command and event loader
├── public/              # Static web files
│   ├── index.html       # Bot homepage
│   ├── 404.png          # 404 image
│   └── fav.png          # Favicon
├── index.js             # Main bot file (streamlined)
├── package.json         # Dependencies
├── thicc.json          # Anime image data
└── .env                # Environment variables
```

## Features

- **Modular Commands**: Each command is in its own file for easy management
- **Event Handling**: Separate event handlers for better organization
- **Web API**: Express server with endpoints for bot status and commands
- **Auto-loading**: Automatically loads commands and events from directories
- **Template System**: Command template for easy development

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:

   ```
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_bot_client_id
   ```

3. Run the bot:
   ```bash
   npm run dev
   ```

## Adding New Commands

1. Create a new file in the `cmds/` directory
2. Use the template in `cmds/_template.js` as a reference
3. Follow this structure:

```javascript
import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("commandname")
    .setDescription("Command description"),

  async execute(interaction) {
    await interaction.reply("Hello World!");
  },
};
```

4. The command will be automatically loaded and registered

## Adding New Events

1. Create a new file in the `events/` directory
2. Follow this structure:

```javascript
import { Events } from "discord.js";

export default {
  name: Events.EventName,
  once: false, // Set to true for one-time events
  async execute(eventData, client) {
    // Event handling logic
  },
};
```

## API Endpoints

- `GET /` - Bot homepage
- `GET /servercount` - Number of servers bot is in
- `GET /botstatus` - Bot's online status and activity
- `GET /botprofile` - Bot's profile information
- `GET /allcmds` - List of all available commands

## Commands

- `/status` - Check if bot is online
- `/help` - Show all available commands
- `/thicc` - Send a random SFW anime image
- `/screenshot <url> [resolution]` - Take a screenshot of a website

## Development

The bot uses ES6 modules and modern JavaScript features. Each component is separated for better maintainability:

- **Commands**: Individual files in `cmds/` directory
- **Events**: Handled in `events/` directory
- **API**: Web server routes in `api/` directory
- **Utils**: Helper functions in `utils/` directory

This modular approach makes it easy to add new features, debug issues, and maintain the codebase as it grows.
