import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import config from './config.json' assert { type: "json" };

const commands = [];
const commandFiles = readdirSync('./commands');

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  commands.push(command.default.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);

try {
  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commands },
  );
  console.log('✅ Slash commands deployed!');
} catch (error) {
  console.error(error);
}
