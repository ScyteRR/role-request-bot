import { Client, Collection, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import config from './config.json' assert { type: "json" };

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands');
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

const eventFiles = fs.readdirSync('./events');
for (const file of eventFiles) {
  const event = await import(`./events/${file}`);
  event.default(client);
}

client.login(config.token);
