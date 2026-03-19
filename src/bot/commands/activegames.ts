import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getUserActiveGames, getStepCount } from '../interactions/gameState';
import { playerGraph } from '../../game/graph';

export async function handleActiveGames(interaction: ChatInputCommandInteraction): Promise<void> {
  const games = getUserActiveGames(interaction.user.id);

  if (games.length === 0) {
    await interaction.reply({
      content: 'You have no active games. Start one with `/pro2pro play`, `/random`, or `/custom`!',
      flags: 64,
    });
    return;
  }

  const lines: string[] = [];
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  for (const { game, lastActivity, createdAt } of games) {
    const startName = playerGraph.getPlayerNameWithFlag(game.startPlayerId);
    const endName = playerGraph.getPlayerNameWithFlag(game.endPlayerId);
    const steps = getStepCount(game);
    const ago = formatTimeAgo(lastActivity);
    const typeLabel = game.type === 'daily' ? '\uD83D\uDCC5 Daily' : '\uD83C\uDFB2 Random/Custom';

    lines.push(
      `${typeLabel} — ${startName} \u2192 ${endName}\n` +
      `\u2003Steps: **${steps}** | Last played: ${ago}`
    );

    // Add continue/give-up buttons (max 5 rows in Discord)
    if (rows.length < 4) {
      const prefix = game.type === 'custom' ? `custom:${game.puzzleId}` : `${game.puzzleId}`;
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`game_search_fwd:${prefix}`)
          .setLabel(`Continue: ${playerGraph.getPlayer(game.startPlayerId)?.name ?? '?'} \u2192 ${playerGraph.getPlayer(game.endPlayerId)?.name ?? '?'}`)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`game_giveup:${game.puzzleId}`)
          .setLabel('\u274C Give Up')
          .setStyle(ButtonStyle.Danger),
      );
      rows.push(row);
    }
  }

  const embed = new EmbedBuilder()
    .setTitle(`\uD83C\uDFAE Active Games (${games.length})`)
    .setDescription(lines.join('\n\n'))
    .setColor(0x5865F2)
    .setFooter({ text: 'Daily games expire after 24h. Random/custom games expire after 6h.' });

  await interaction.reply({ embeds: [embed], components: rows, flags: 64 });
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
