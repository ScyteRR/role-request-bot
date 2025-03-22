import { EmbedBuilder } from 'discord.js';
import config from '../config.json' assert { type: "json" };

export default (client) => {
  client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
    }

    if (interaction.isButton()) {
      const [action, userId, roleId] = interaction.customId.split('-');
      const member = await interaction.guild.members.fetch(userId);
      const role = interaction.guild.roles.cache.get(roleId);

      let hasPermission = false;

      for (const [approverRoleId, allowedRoles] of Object.entries(config.roleGroups)) {
        if (
          interaction.member.roles.cache.has(approverRoleId) &&
          allowedRoles.includes(roleId)
        ) {
          hasPermission = true;
          break;
        }
      }

      if (!hasPermission) {
        return interaction.reply({
          content: 'You cannot approve or deny this role request.',
          ephemeral: true
        });
      }

      const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setColor(action === 'accept' ? '#2ecc71' : '#e74c3c')
        .spliceFields(2, 1, {
          name: 'Status',
          value: action === 'accept' ? '✅ Accepted' : '❌ Denied',
          inline: false,
        });

      if (action === 'accept') {
        await member.roles.add(role);

        try {
          await member.send({
            content: `✅ Your request for the **${role.name}** role in **${interaction.guild.name}** has been **approved**.`
          });
        } catch (err) {
          console.warn(`Could not send DM to ${member.user.tag}`);
        }
      }

      await interaction.update({
        embeds: [updatedEmbed],
        components: [],
      });
    }
  });
}
