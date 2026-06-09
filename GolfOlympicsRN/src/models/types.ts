import { MedalKey, PointConfig, DEFAULT_POINT_CONFIG } from '../config/gameConfig';

export interface Player {
  id: string;
  name: string;
}

export interface HoleResult {
  holeNumber: number;
  medals: Record<string, MedalKey>;
  diamonds: Record<string, boolean>;
  saoichi: Record<string, boolean>;
  neapin: string | null;
  birdie: Record<string, boolean>;
  isShort: boolean;
}

export function emptyHoleResult(holeNumber: number): HoleResult {
  return {
    holeNumber,
    medals: {},
    diamonds: {},
    saoichi: {},
    neapin: null,
    birdie: {},
    isShort: false,
  };
}

export function calcHolePoints(
  playerId: string,
  hole: HoleResult,
  config: PointConfig = DEFAULT_POINT_CONFIG,
): number {
  const { medals, diamonds, saoichi, neapin, birdie } = hole;
  let pts = 0;

  if (diamonds[playerId]) {
    pts += config.diamond;
  } else if (medals[playerId]) {
    pts += config[medals[playerId]];
    if (saoichi[playerId]) pts += config.saoichiBonus;
  }

  if (neapin === playerId) pts += config.neapin;
  if (birdie[playerId]) pts += config.birdie;

  return pts;
}

export function calcTotalPoints(
  playerId: string,
  holeResults: HoleResult[],
  config: PointConfig = DEFAULT_POINT_CONFIG,
): number {
  return holeResults.reduce((sum, hole) => sum + calcHolePoints(playerId, hole, config), 0);
}

export const TOTAL_HOLES = 18;
