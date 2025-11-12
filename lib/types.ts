export type Player = {
  id: string;
  name: string;
  role: 'bat' | 'bowl' | 'all';
  batting: number; // 0-100
  bowling: number; // 0-100
};

export type Team = {
  id: string;
  name: string;
  shortName: string;
  rating: number; // 0-100 overall
  squad: Player[];
  lineup: string[]; // player ids, batting order
};

export type InningsScore = {
  runs: number;
  wickets: number;
  overs: number; // balls/6
  balls: number; // total balls bowled
  byes: number;
  legByes: number;
  wides: number;
  noBalls: number;
  fours: number;
  sixes: number;
};

export type MatchResult =
  | { status: 'scheduled' }
  | { status: 'live'; inning: 1 | 2; target?: number }
  | { status: 'completed'; winnerTeamId: string; margin: string };

export type Match = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: string;
  result: MatchResult;
  scoreA?: InningsScore; // home batting
  scoreB?: InningsScore; // away batting
};

export type StandingRow = {
  teamId: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  nrr: number; // net run rate (simple)
  points: number;
};

export type LeagueState = {
  teams: Team[];
  fixtures: Match[];
  standings: StandingRow[];
  records: {
    highestTeamTotal: { teamId: string; runs: number } | null;
    bestBowling: { playerId: string; wickets: number; runs: number } | null;
    highestIndividualScore: { playerId: string; runs: number } | null;
  };
};

export type MatchConfig = {
  oversPerInnings: number;
  simSpeed: number; // 0.5 - 4
};

export type LiveFrame = {
  ballIndex: number;
  over: number;
  strikerIndex: number;
  nonStrikerIndex: number;
  bowlerIndex: number;
  outcome: 'dot' | '1' | '2' | '3' | '4' | '6' | 'w' | 'nb' | 'wd' | 'lb' | 'b';
  runsAdded: number; // includes extras when applicable
  wicket: boolean;
  commentary: string;
  visual: {
    // normalized 0..1 field space for simple animation
    path: { x: number; y: number }[];
    color: string;
  };
};
