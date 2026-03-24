import { ChatInputCommandInteraction } from 'discord.js';
import { config } from '../../config';
import { pandaScoreSync } from '../../data/sync/pandaScore';
import { getDb } from '../../data/db';
import { playerGraph } from '../../game/graph';

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

  if (sub === 'fix-female-flags') {
    const db = getDb();
    const result = db.prepare(`UPDATE players SET is_female = 0`).run();
    playerGraph.build();
    await interaction.reply({
      content: `Reset is_female flag on ${result.changes} players and rebuilt graph. Players incorrectly hidden from search should now appear.`,
      flags: 64,
    });
  }

  if (sub === 'rename-player') {
    const db = getDb();
    const search = interaction.options.getString('player', true).trim();
    const newName = interaction.options.getString('name', true).trim();

    // Find the player — exact name match first, then case-insensitive partial
    let player = db.prepare(`SELECT id, name FROM players WHERE name = ? COLLATE NOCASE`).get(search) as { id: number; name: string } | undefined;
    if (!player) {
      player = db.prepare(`SELECT id, name FROM players WHERE name LIKE ? COLLATE NOCASE LIMIT 1`).get(`%${search}%`) as { id: number; name: string } | undefined;
    }

    if (!player) {
      await interaction.reply({ content: `No player found matching "${search}".`, flags: 64 });
      return;
    }

    db.prepare(`UPDATE players SET name = ? WHERE id = ?`).run(newName, player.id);
    playerGraph.build();
    await interaction.reply({
      content: `Renamed: **${player.name}** → **${newName}** (id: ${player.id}). This name will survive all future syncs.`,
      flags: 64,
    });
  }
}
