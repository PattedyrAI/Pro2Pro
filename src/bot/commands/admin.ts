import { ChatInputCommandInteraction } from 'discord.js';
import { config } from '../../config';
import { pandaScoreSync } from '../../data/sync/pandaScore';

export async function handleAdmin(interaction: ChatInputCommandInteraction): Promise<void> {
  if (interaction.user.id !== config.adminUserId) {
    await interaction.reply({ content: 'Not authorised.', flags: 64 });
    return;
  }

  const sub = interaction.options.getSubcommand();

  if (sub === 'resync') {
    await interaction.deferReply({ flags: 64 });
    try {
      await interaction.editReply('Resync started — clearing rosters and re-fetching from PandaScore. This takes several minutes...');
      const result = await pandaScoreSync.resetAndSync();
      await interaction.editReply(
        `Resync complete.\n**Teams:** ${result.teams}\n**Players:** ${result.players}\n**Roster connections:** ${result.rosters}`
      );
    } catch (err: any) {
      await interaction.editReply(`Resync failed: ${err?.message ?? err}`);
    }
  }
}
