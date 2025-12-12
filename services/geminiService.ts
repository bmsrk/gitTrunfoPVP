import { CardData, StatType } from "../types";

// Local templates for commentary to replace AI
const TEMPLATES = {
  WIN: [
    "crushed the competition with superior",
    "dominated this commit with better",
    "merged successfully thanks to higher",
    "outperformed the opponent with massive",
    "is the clear maintainer here with more"
  ],
  DRAW: [
    "It's a merge conflict! Identical",
    "No changes detected. Tied on",
    "Evenly matched branches on"
  ]
};

export const getBattleCommentary = async (
  winner: CardData,
  loser: CardData,
  stat: StatType,
  winnerName: string
): Promise<string> => {
  // Simulate a brief "thinking" delay for UX
  await new Promise(resolve => setTimeout(resolve, 50));

  const statName = stat.replace('public_', '').replace('_', ' ');

  if (winner.login === loser.login) {
    // Draw scenario
    const template = TEMPLATES.DRAW[Math.floor(Math.random() * TEMPLATES.DRAW.length)];
    return `${template} ${statName}.`;
  }

  const template = TEMPLATES.WIN[Math.floor(Math.random() * TEMPLATES.WIN.length)];
  return `${winner.login} ${template} ${statName} (${winner[stat]} vs ${loser[stat]}).`;
};