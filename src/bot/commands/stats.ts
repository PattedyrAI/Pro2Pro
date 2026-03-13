import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import {
  getUserStats,
  getUserAllStats,
  getTopPlayerPicks,
  getUserRegionStats,
  getUserCountryStats,
  getUniquePlayerCount,
} from '../../data/models/userStats';
import { playerGraph } from '../../game/graph';
import { getRegionEmoji, countryToFlag } from '../../game/regions';

export async function handleStats(interaction: ChatInputCommandInteraction): Promise<void> {
  const view = interaction.options.getString('view') ?? 'all';
  const targetUser = interaction.options.getUser('user') ?? interaction.user;
  const userId = targetUser.id;
  const username = targetUser.displayName;

  const embed = view === 'daily'
    ? buildDailyEmbed(username, userId)
    : buildAllTimeEmbed(username, userId);

  await interaction.reply({ embeds: [embed] });
}

function buildAllTimeEmbed(username: string, userId: string): EmbedBuilder {
  const stats = getUserAllStats(userId);
  const totalPlayed = stats.daily_played + stats.custom_played + stats.random_played;
  const totalWon = stats.daily_won + stats.custom_won + stats.random_won;
  const totalGames = totalPlayed + stats.games_given_up;
  const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;
  const completionRate = totalGames > 0 ? Math.round((totalPlayed / totalGames) * 100) : 0;
  const uniquePlayers = getUniquePlayerCount(userId);

  const embed = new EmbedBuilder()
    .setTitle(`📊 Pro2Pro Stats — ${username}`)
    .setColor(0x5865F2);

  // Row 1: Core numbers
  embed.addFields(
    { name: '🎮 Games Played', value: `${totalPlayed}`, inline: true },
    { name: '⭐ Optimal Paths', value: `${totalWon} (${winRate}%)`, inline: true },
    { name: '🏳️ Given Up', value: `${stats.games_given_up}`, inline: true },
  );

  // Row 2: Streaks & performance
  embed.addFields(
    { name: '🔥 Current Streak', value: `${stats.current_streak}`, inline: true },
    { name: '🏆 Best Streak', value: `${stats.max_streak}`, inline: true },
    { name: '📏 Avg Path Length', value: `${stats.avg_path_length.toFixed(1)}`, inline: true },
  );

  // Row 3: Link stats
  embed.addFields(
    { name: '🔗 Total Links Made', value: `${stats.total_links}`, inline: true },
    { name: '👥 Unique Players Used', value: `${uniquePlayers}`, inline: true },
    { name: '✅ Completion Rate', value: `${completionRate}%`, inline: true },
  );

  // Row 4: Game breakdown
  const breakdownLines = [
    `Daily: **${stats.daily_played}** played · **${stats.daily_won}** optimal`,
    `Custom: **${stats.custom_played}** played · **${stats.custom_won}** optimal`,
    `Random: **${stats.random_played}** played · **${stats.random_won}** optimal`,
  ];
  embed.addFields({ name: '📋 Game Breakdown', value: breakdownLines.join('\n') });

  // Row 5: Most picked players
  const picks = getTopPlayerPicks(userId, 5);
  if (picks.length > 0) {
    const pickLines = picks.map((p, i) => {
      const player = playerGraph.getPlayer(p.player_id);
      const name = player
        ? playerGraph.getPlayerNameWithFlag(p.player_id)
        : `Unknown (#${p.player_id})`;
      return `${i + 1}. ${name} (${p.pick_count} ${p.pick_count === 1 ? 'pick' : 'picks'})`;
    });
    embed.addFields({ name: '🎯 Most Guessed Players', value: pickLines.join('\n') });
  }

  // Row 6: Best regions bar chart
  const regions = getUserRegionStats(userId);
  if (regions.length > 0) {
    const totalPicks = regions.reduce((sum, r) => sum + r.pick_count, 0);
    const regionLines = regions.slice(0, 5).map(r => {
      const pct = Math.round((r.pick_count / totalPicks) * 100);
      const barLen = Math.round(pct / 8);
      const bar = '█'.repeat(barLen) + '░'.repeat(Math.max(0, 12 - barLen));
      return `${getRegionEmoji(r.region)} ${r.region} ${bar} ${pct}%`;
    });
    embed.addFields({ name: '🌍 Best Regions', value: regionLines.join('\n') });
  }

  // Row 7: Top countries
  const countries = getUserCountryStats(userId, 5);
  if (countries.length > 0) {
    const countryLines = countries.map(c => {
      const flag = countryToFlag(c.nationality);
      return `${flag} ${c.nationality} (${c.pick_count})`;
    });
    embed.addFields({ name: '🏳️ Top Countries', value: countryLines.join(' · ') });
  }

  embed.setFooter({
    text: `All games · ${stats.daily_played} daily · ${stats.custom_played} custom · ${stats.random_played} random`,
  });

  return embed;
}

function buildDailyEmbed(username: string, userId: string): EmbedBuilder {
  const stats = getUserStats(userId);
  const allStats = getUserAllStats(userId);
  const winRate = stats.games_played > 0
    ? Math.round((stats.games_won / stats.games_played) * 100)
    : 0;
  const uniquePlayers = getUniquePlayerCount(userId);

  const embed = new EmbedBuilder()
    .setTitle(`📊 Pro2Pro Stats — ${username}`)
    .setColor(0x5865F2);

  // Row 1: Core numbers
  embed.addFields(
    { name: '🎮 Games Played', value: `${stats.games_played}`, inline: true },
    { name: '⭐ Optimal Paths', value: `${stats.games_won} (${winRate}%)`, inline: true },
    { name: '🏳️ Given Up', value: `${allStats.games_given_up}`, inline: true },
  );

  // Row 2: Streaks & performance
  embed.addFields(
    { name: '🔥 Current Streak', value: `${stats.current_streak}`, inline: true },
    { name: '🏆 Best Streak', value: `${stats.max_streak}`, inline: true },
    { name: '📏 Avg Path Length', value: `${stats.avg_path_length.toFixed(1)}`, inline: true },
  );

  // Row 3: Link stats (all-time since we can't split by mode)
  embed.addFields(
    { name: '🔗 Total Links Made', value: `${allStats.total_links}`, inline: true },
    { name: '👥 Unique Players Used', value: `${uniquePlayers}`, inline: true },
    { name: '\u200B', value: '\u200B', inline: true },
  );

  // Most picked players (all-time aggregate)
  const picks = getTopPlayerPicks(userId, 5);
  if (picks.length > 0) {
    const pickLines = picks.map((p, i) => {
      const player = playerGraph.getPlayer(p.player_id);
      const name = player
        ? playerGraph.getPlayerNameWithFlag(p.player_id)
        : `Unknown (#${p.player_id})`;
      return `${i + 1}. ${name} (${p.pick_count} ${p.pick_count === 1 ? 'pick' : 'picks'})`;
    });
    embed.addFields({ name: '🎯 Most Guessed Players', value: pickLines.join('\n') });
  }

  // Best regions bar chart
  const regions = getUserRegionStats(userId);
  if (regions.length > 0) {
    const totalPicks = regions.reduce((sum, r) => sum + r.pick_count, 0);
    const regionLines = regions.slice(0, 5).map(r => {
      const pct = Math.round((r.pick_count / totalPicks) * 100);
      const barLen = Math.round(pct / 8);
      const bar = '█'.repeat(barLen) + '░'.repeat(Math.max(0, 12 - barLen));
      return `${getRegionEmoji(r.region)} ${r.region} ${bar} ${pct}%`;
    });
    embed.addFields({ name: '🌍 Best Regions', value: regionLines.join('\n') });
  }

  // Top countries
  const countries = getUserCountryStats(userId, 5);
  if (countries.length > 0) {
    const countryLines = countries.map(c => {
      const flag = countryToFlag(c.nationality);
      return `${flag} ${c.nationality} (${c.pick_count})`;
    });
    embed.addFields({ name: '🏳️ Top Countries', value: countryLines.join(' · ') });
  }

  embed.setFooter({ text: 'Showing daily games only · Player picks & regions are all-time' });

  return embed;
}
