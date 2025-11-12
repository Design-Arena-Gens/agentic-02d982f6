import type { LeagueState, LiveFrame, Match, MatchConfig, InningsScore } from './types';
import { seeded } from './prng';

export type SimState = {
  frames: LiveFrame[];
  completed: boolean;
  match: Match;
};

function initialInnings(): InningsScore {
  return { runs: 0, wickets: 0, overs: 0, balls: 0, byes: 0, legByes: 0, wides: 0, noBalls: 0, fours: 0, sixes: 0 };
}

function outcomeToRuns(o: LiveFrame['outcome']): number {
  switch (o) {
    case '1': return 1;
    case '2': return 2;
    case '3': return 3;
    case '4': return 4;
    case '6': return 6;
    case 'nb': return 1;
    case 'wd': return 1;
    case 'lb': return 1; // simplified
    case 'b': return 1; // simplified
    default: return 0;
  }
}

function randomOutcome(r: () => number, battingBias: number): LiveFrame['outcome'] {
  const p = r();
  const bias = Math.min(Math.max(battingBias, -0.2), 0.2);
  const weights = [
    { o: 'w', w: 0.06 - bias / 3 },
    { o: 'dot', w: 0.38 - bias / 2 },
    { o: '1', w: 0.26 + bias / 2 },
    { o: '2', w: 0.11 + bias / 4 },
    { o: '3', w: 0.03 + bias / 10 },
    { o: '4', w: 0.11 + bias / 3 },
    { o: '6', w: 0.05 + bias / 4 },
    { o: 'wd', w: 0.015 },
    { o: 'nb', w: 0.01 },
    { o: 'lb', w: 0.01 },
    { o: 'b', w: 0.01 },
  ];
  const total = weights.reduce((s, x) => s + x.w, 0);
  let acc = 0, x = p * total;
  for (const w of weights) { acc += w.w; if (x <= acc) return w.o as LiveFrame['outcome']; }
  return 'dot';
}

function pathForOutcome(r: () => number, outcome: LiveFrame['outcome']) {
  const mid = { x: 0.5, y: 0.5 };
  const bowler = { x: 0.5, y: 0.1 };
  const striker = { x: 0.5, y: 0.55 };
  const angle = r() * Math.PI * 2;
  const powerBase = { dot: 0.1, '1': 0.25, '2': 0.35, '3': 0.5, '4': 0.7, '6': 0.9, w: 0.15, nb: 0.4, wd: 0.2, lb: 0.2, b: 0.2 } as const;
  const power = powerBase[outcome] ?? 0.2;
  const far = { x: 0.5 + Math.cos(angle) * power, y: 0.5 - Math.sin(angle) * power };
  const path = [bowler, mid, striker, far];
  const color = outcome === 'w' ? '#ef476f' : outcome === '4' ? '#ffd166' : outcome === '6' ? '#06d6a0' : '#5bc0be';
  return { path, color };
}

export function simulateNextBall(seed: string, match: Match, battingAdv: number, framesSoFar: number): { frame: LiveFrame; advanceOver: boolean } {
  const r = seeded(seed + ':' + framesSoFar);
  const outcome = randomOutcome(r, battingAdv);
  const visual = pathForOutcome(r, outcome);
  const runs = outcomeToRuns(outcome);
  const wicket = outcome === 'w';
  const over = Math.floor(framesSoFar / 6);
  const ballIndex = framesSoFar % 6;
  const frame: LiveFrame = {
    ballIndex,
    over,
    strikerIndex: 0,
    nonStrikerIndex: 1,
    bowlerIndex: 0,
    outcome,
    runsAdded: runs,
    wicket,
    commentary: wicket ? 'Bowled him!' : outcome === '4' ? 'Cracking boundary!' : outcome === '6' ? 'Huge six!' : runs > 0 ? `${runs} run(s)` : 'Dot ball',
    visual,
  };
  const advanceOver = outcome === 'wd' || outcome === 'nb' ? false : true;
  return { frame, advanceOver };
}

export function stepMatch(match: Match, cfg: MatchConfig, seed: string): SimState {
  const frames: LiveFrame[] = [];
  let scoreA = match.scoreA ?? initialInnings();
  let scoreB = match.scoreB ?? initialInnings();
  let inning: 1 | 2 = match.result.status === 'live' ? match.result.inning : 1;
  const limitBalls = cfg.oversPerInnings * 6;
  let ballPtr = 0;
  while (ballPtr < limitBalls) {
    const battingAdv = inning === 1 ? 0.05 : -0.02; // tiny bias
    const { frame, advanceOver } = simulateNextBall(seed, match, battingAdv, ballPtr);
    frames.push(frame);
    const targetScore = inning === 2 ? scoreA.runs + 1 : undefined;
    if (inning === 1) {
      if (frame.outcome === 'wd') scoreA.wides += 1;
      else if (frame.outcome === 'nb') scoreA.noBalls += 1;
      else {
        scoreA.balls += 1;
        if (frame.ballIndex === 5) scoreA.overs += 1;
        if (frame.outcome === '4') scoreA.fours += 1;
        if (frame.outcome === '6') scoreA.sixes += 1;
        if (frame.wicket) scoreA.wickets += 1;
      }
      scoreA.runs += frame.runsAdded;
    } else {
      if (frame.outcome === 'wd') scoreB.wides += 1;
      else if (frame.outcome === 'nb') scoreB.noBalls += 1;
      else {
        scoreB.balls += 1;
        if (frame.ballIndex === 5) scoreB.overs += 1;
        if (frame.outcome === '4') scoreB.fours += 1;
        if (frame.outcome === '6') scoreB.sixes += 1;
        if (frame.wicket) scoreB.wickets += 1;
      }
      scoreB.runs += frame.runsAdded;
      if (targetScore && scoreB.runs >= targetScore) {
        // chase complete early
        break;
      }
    }
    if (advanceOver) ballPtr += 1; // wides/nbs do not count to balls
  }
  // If inning 1 finished, set up inning 2 minimal state
  if (inning === 1) {
    const live: Match = { ...match, scoreA, result: { status: 'live', inning: 2, target: scoreA.runs + 1 } };
    return { frames, completed: false, match: live };
  }
  // else inning 2 end -> finalize
  const winner = scoreA.runs === scoreB.runs
    ? match.homeTeamId
    : (scoreA.runs > scoreB.runs ? match.homeTeamId : match.awayTeamId);
  const margin = scoreA.runs === scoreB.runs
    ? 'tie (home awarded)' : Math.abs(scoreA.runs - scoreB.runs) + (scoreA.runs > scoreB.runs ? ' runs' : ' wickets');
  const completed: Match = { ...match, scoreA, scoreB, result: { status: 'completed', winnerTeamId: winner, margin } };
  return { frames, completed: true, match: completed };
}
