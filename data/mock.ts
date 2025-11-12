import type { LeagueState, Match, Player, Team } from '@/lib/types';

function makePlayer(i: number, role: 'bat' | 'bowl' | 'all'): Player {
  const base = 50 + (i % 20);
  return {
    id: `p-${role}-${i}`,
    name: `${role.toUpperCase()} Player ${i}`,
    role,
    batting: Math.min(95, base + (role !== 'bowl' ? 20 : 0)),
    bowling: Math.min(95, base + (role !== 'bat' ? 20 : 0)),
  };
}

function makeTeam(id: string, shortName: string, name: string, seed: number): Team {
  const squad: Player[] = [];
  for (let i = 0; i < 6; i++) squad.push(makePlayer(seed * 100 + i, 'bat'));
  for (let i = 0; i < 5; i++) squad.push(makePlayer(seed * 100 + 50 + i, 'bowl'));
  for (let i = 0; i < 4; i++) squad.push(makePlayer(seed * 100 + 100 + i, 'all'));
  const lineup = squad.slice(0, 11).map((p) => p.id);
  const rating = 70 + (seed % 5) * 5;
  return { id, shortName, name, rating, squad, lineup };
}

function roundRobin(teams: Team[]): Match[] {
  const fixtures: Match[] = [];
  let id = 1;
  const date = new Date();
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      date.setDate(date.getDate() + 1);
      fixtures.push({
        id: `m-${id++}`,
        homeTeamId: teams[i].id,
        awayTeamId: teams[j].id,
        scheduledAt: date.toISOString(),
        result: { status: 'scheduled' },
      });
    }
  }
  return fixtures;
}

export function defaultLeague(): LeagueState {
  const teams = [
    makeTeam('t-a', 'LIO', 'Lions', 1),
    makeTeam('t-b', 'EAG', 'Eagles', 2),
    makeTeam('t-c', 'TIG', 'Tigers', 3),
    makeTeam('t-d', 'WOL', 'Wolves', 4),
  ];
  const fixtures = roundRobin(teams);
  return {
    teams,
    fixtures,
    standings: teams.map((t) => ({ teamId: t.id, played: 0, won: 0, lost: 0, tied: 0, nrr: 0, points: 0 })),
    records: {
      highestTeamTotal: null,
      bestBowling: null,
      highestIndividualScore: null,
    },
  };
}
