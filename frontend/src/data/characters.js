// Static interface artwork and the existing arena's prototype attributes.
export const CHARACTERS = [
  {
    id: "sung-jinwoo", name: "Sung Jin-Woo", series: "Solo Leveling", tier: "GOD",
    role: "Shadow Monarch", title: ["THE SHADOW", "MONARCH."], color: "#a489ff",
    portrait: "/art/sung-jinwoo.webp", epithet: "An army in his shadow.",
    description: "From the weakest hunter to a power beyond the ranks. The fallen rise at his command. Every shadow answers to him.",
    signature: "Shadow Extraction", allegiance: "Shadow Army",
    powerAttributes: { strength: 9800, speed: 9700, defense: 8500, intelligence: 8000, endurance: 9000, aura: 9500, critical_rate: 75, evasion_rate: 60 },
    abilities: [{ name: "Shadow Extraction", detail: "Raises the fallen as soldiers bound to his command." }, { name: "Ruler’s Authority", detail: "Exerts force over the battlefield without making contact." }],
  },
  {
    id: "gojo-satoru", name: "Gojo Satoru", series: "Jujutsu Kaisen", tier: "GOD",
    role: "The Strongest Sorcerer", title: ["BEYOND", "INFINITY."], color: "#76ccf4",
    portrait: "/art/gojo-satoru.webp", epithet: "Infinity stands between you.",
    description: "Six Eyes. Limitless power. A sorcerer whose very existence shifts the balance of the world.",
    signature: "Limitless", allegiance: "Tokyo Jujutsu High",
    powerAttributes: { strength: 9200, speed: 9500, defense: 9900, intelligence: 9800, endurance: 9000, aura: 9800, critical_rate: 55, evasion_rate: 80 },
    abilities: [{ name: "Infinity", detail: "Slows anything approaching through an infinite division of space." }, { name: "Hollow Purple", detail: "Combines attraction and repulsion into a devastating technique." }],
  },
  {
    id: "madara", name: "Madara Uchiha", series: "Naruto", tier: "S",
    role: "Ghost of the Uchiha", title: ["A LEGEND", "REAWAKENS."], color: "#ed7b93",
    portrait: "/art/madara.webp", epithet: "The battlefield remembers.",
    description: "A legendary shinobi with the power to challenge an army. His name alone casts a shadow across the ninja world.",
    signature: "Perfect Susanoo", allegiance: "Uchiha Clan",
    powerAttributes: { strength: 9600, speed: 9200, defense: 8500, intelligence: 9700, endurance: 9500, aura: 8000, critical_rate: 80, evasion_rate: 60 },
    abilities: [{ name: "Perfect Susanoo", detail: "Manifests a colossal armored warrior with overwhelming reach." }, { name: "Limbo", detail: "Projects unseen doubles into a parallel plane." }],
  },
  {
    id: "ichigo", name: "Ichigo Kurosaki", series: "Bleach", tier: "S",
    role: "Substitute Soul Reaper", color: "#f5ad72", portrait: "/art/ichigo.webp",
    epithet: "The resolve to protect.",
    description: "A soul reaper who crosses the boundaries between worlds, drawing strength from an extraordinary heritage and his will to protect.",
    powerAttributes: { strength: 9300, speed: 9400, defense: 8000, intelligence: 7800, endurance: 9500, aura: 9200, critical_rate: 60, evasion_rate: 62 },
    abilities: [{ name: "Getsuga Tenshō", detail: "Releases a crescent of concentrated spiritual pressure." }, { name: "Bankai", detail: "Concentrates his power into extraordinary speed and force." }],
  },
  {
    id: "zoro", name: "Roronoa Zoro", series: "One Piece", tier: "S",
    role: "Pirate Hunter", color: "#a0cf91", portrait: "/art/zoro.webp",
    epithet: "Three swords. One promise.",
    description: "A swordsman whose ambition is matched only by his loyalty. Every battle brings him closer to becoming the world's greatest.",
    powerAttributes: { strength: 8350, speed: 8000, defense: 8300, intelligence: 7000, endurance: 9500, aura: 8000, critical_rate: 80, evasion_rate: 55 },
    abilities: [{ name: "Three-Sword Style", detail: "Combines three blades into a relentless fighting style." }, { name: "Conqueror’s Haki", detail: "Channels exceptional will into his attacks." }],
  },
  {
    id: "levi", name: "Levi Ackermann", series: "Attack on Titan", tier: "A",
    role: "Humanity’s Strongest", color: "#c8c4b3", portrait: "/art/levi.webp",
    epithet: "Precision without hesitation.",
    description: "The Survey Corps' most formidable soldier. In the face of impossible odds, his discipline turns every movement into a decisive strike.",
    powerAttributes: { strength: 8500, speed: 9000, defense: 7500, intelligence: 8800, endurance: 8200, aura: 7000, critical_rate: 85, evasion_rate: 90 },
    abilities: [{ name: "Ackermann Instinct", detail: "Combines heightened physical ability with exceptional combat awareness." }, { name: "ODM Maneuvers", detail: "Uses rapid changes in direction to strike from unexpected angles." }],
  },
].map(character => ({
  ...character,
  stats: Object.fromEntries(["strength", "speed", "defense", "aura"].map(key => [key[0].toUpperCase() + key.slice(1), character.powerAttributes[key]])),
}));

export const JINWOO_COLLECTION = {
  embedUrl: "https://sketchfab.com/playlists/embed?collection=8def5dabb51a4804ada3a2ead74e2489&autostart=1",
  url: "https://sketchfab.com/fernanflowvera/collections/gffgfg-8def5dabb51a4804ada3a2ead74e2489",
  curatorUrl: "https://sketchfab.com/fernanflowvera",
};
