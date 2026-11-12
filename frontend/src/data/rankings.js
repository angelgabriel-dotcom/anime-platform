import { CHARACTERS } from "./characters";

export const POWER_STATS = ["strength", "speed", "defense", "intelligence", "endurance", "aura"];
const RATE_STATS = ["critical_rate", "evasion_rate"];

export function rosterRankings() {
  return CHARACTERS.map(character => ({
    character,
    powerTotal: POWER_STATS.reduce((total, key) => total + character.powerAttributes[key], 0)
      + character.powerAttributes.critical_rate * 10 + character.powerAttributes.evasion_rate * 5,
    winRate: null,
    totalBattles: null,
  }));
}

// The API supplies combat values; shared character data supplies interface artwork.
export function readRankings(data) {
  if (!data || (data.entries !== null && !Array.isArray(data.entries))) throw new Error("Incomplete rankings");
  if (data.entries === null && data.total !== 0) throw new Error("Incomplete rankings");
  const seen = new Set();
  return (data.entries || []).map(entry => {
    const character = entry?.character;
    const attrs = character?.power_attributes;
    if (!character || !["id", "name", "series", "tier"].every(key => typeof character[key] === "string" && character[key].trim())
      || seen.has(character.id)
      || ![...POWER_STATS, ...RATE_STATS].every(key => Number.isFinite(attrs?.[key]) && attrs[key] >= 0 && attrs[key] <= (RATE_STATS.includes(key) ? 100 : 10000))
      || !Number.isFinite(entry.power_total) || entry.power_total < 0
      || !Number.isInteger(entry.total_battles) || entry.total_battles < 0
      || !Number.isFinite(entry.win_rate) || entry.win_rate < 0 || entry.win_rate > 1) throw new Error("Incomplete rankings");
    seen.add(character.id);
    const artwork = CHARACTERS.find(item => item.id === character.id);
    return {
      character: {
        ...artwork, id: character.id, name: character.name, series: character.series, tier: character.tier,
        color: artwork?.color || "#c3a7ff", portrait: artwork?.portrait,
        description: character.lore || artwork?.description,
        powerAttributes: attrs,
        availableInArena: !!artwork,
      },
      powerTotal: entry.power_total,
      winRate: entry.total_battles > 0 ? entry.win_rate : null,
      totalBattles: entry.total_battles,
    };
  });
}

export function rankEntries(entries, sortBy) {
  return [...entries].sort((a, b) => {
    if (sortBy === "win_rate") {
      const rateDifference = (b.winRate ?? -1) - (a.winRate ?? -1);
      if (rateDifference) return rateDifference;
    }
    if (sortBy === "battles" && a.totalBattles !== b.totalBattles) return (b.totalBattles ?? -1) - (a.totalBattles ?? -1);
    return b.powerTotal - a.powerTotal || a.character.name.localeCompare(b.character.name);
  }).map((entry, index) => ({ ...entry, rank: index + 1 }));
}
