import type { LeagueState, Match } from './types';

export function recomputeStandings(league: LeagueState): LeagueState {
  const map = new Map<string, { played: number; won: number; lost: number; tied: number; runsFor: number; oversFac: number; runsAg: number; oversAga: number }>();
  for (const t of league.teams) {
    map.set(t.id, { played: 0, won: 0, lost: 0, tied: 0, runsFor: 0, oversFac: 0, runsAg: 0, oversAga: 0 });
  }
  for (const m of league.fixtures) {
    if (m.result.status !== 'completed') continue;
    const a = m.homeTeamId, b = m.awayTeamId;
    const sA = m.scoreA!, sB = m.scoreB!;
    const oA = sA.overs + sA.balls / 6, oB = sB.overs + sB.balls / 6;
    const rowA = map.get(a)!; const rowB = map.get(b)!;
    rowA.played++; rowB.played++;
    rowA.runsFor += sA.runs; rowA.oversFac += oA; rowA.runsAg += sB.runs; rowA.oversAga += oB;
    rowB.runsFor += sB.runs; rowB.oversFac += oB; rowB.runsAg += sA.runs; rowB.oversAga += oA;
    if (sA.runs > sB.runs) { rowA.won++; rowB.lost++; }
    else if (sB.runs > sA.runs) { rowB.won++; rowA.lost++; }
    else { rowA.tied++; rowB.tied++; }
  }
  const standings = league.teams.map((t) => {
    const r = map.get(t.id)!;
    const nrr = (r.runsFor / Math.max(r.oversFac, 0.1)) - (r.runsAg / Math.max(r.oversAga, 0.1));
    return {
      teamId: t.id,
      played: r.played,
      won: r.won,
      lost: r.lost,
      tied: r.tied,
      nrr: Number(nrr.toFixed(2)),
      points: r.won * 2 + r.tied,
    };
  }).sort((a, b) => (b.points - a.points) || (b.nrr - a.nrr));
  return { ...league, standings };
}

export function applyCompletedMatch(league: LeagueState, match: Match): LeagueState {
  const fixtures = league.fixtures.map((m) => (m.id === match.id ? match : m));
  // update simple records
  let records = { ...league.records };
  if (match.result.status === 'completed' && match.scoreA && match.scoreB) {
    const bestRuns = Math.max(match.scoreA.runs, match.scoreB.runs);
    const bestTeamId = match.scoreA.runs >= match.scoreB.runs ? match.homeTeamId : match.awayTeamId;
    if (!records.highestTeamTotal || bestRuns > records.highestTeamTotal.runs) {
      records = { ...records, highestTeamTotal: { teamId: bestTeamId, runs: bestRuns } };
    }
  }
  const next = { ...league, fixtures, records };
  return recomputeStandings(next);
}
