import {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle
} from 'discord.js';
import config from '../config.json' assert { type: "json" };

export default {
  data: new SlashCommandBuilder()
    .setName('rolerequest')
    .setDescription('Request a specific role.')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role you want to request')
        .setRequired(true)
    ),
  async execute(interaction) {
    const role = interaction.options.getRole('role');

    // Collect all requestable roles from all groups
    const allRequestableRoles = Object.values(config.roleGroups).flat();
    if (!allRequestableRoles.includes(role.id)) {
      return interaction.reply({ content: 'You cannot request this role.', ephemeral: true });
    }

    const userRoles = interaction.member.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .map(r => r.name).join(', ') || 'No roles';

    const embed = new EmbedBuilder()
      .setTitle('Role Request')
      .setDescription(`${interaction.user} has requested the role ${role}`)
      .addFields(
        { name: 'Submitted', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        { name: 'User Roles', value: userRoles, inline: true },
        { name: 'Status', value: 'Pending', inline: false }
      )
      .setColor('#3498db')
      .setFooter({ text: `User ID: ${interaction.user.id}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`accept-${interaction.user.id}-${role.id}`).setLabel('✅ Accept').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`deny-${interaction.user.id}-${role.id}`).setLabel('❌ Deny').setStyle(ButtonStyle.Danger)
    );

    const modChannel = interaction.guild.channels.cache.get(config.modChannelId);
    if (modChannel) {
      await modChannel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: 'Your request has been sent for approval.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Moderation channel not found.', ephemeral: true });
    }
  }
}