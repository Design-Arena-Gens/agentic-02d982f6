"use client";
import React from 'react';
import type { LeagueState } from '@/lib/types';

export function Scoreboard({ league }: { league: LeagueState }) {
  const live = league.fixtures.find((m) => m.result.status === 'live');
  if (!live) {
    return (
      <div className="panel">
        <div className="panel-header"><strong>Scoreboard</strong></div>
        <div className="panel-body">No live match. Start a simulation from Home.</div>
      </div>
    );
  }
  const a = live.scoreA ?? { runs: 0, wickets: 0, overs: 0, balls: 0 };
  const b = live.scoreB ?? { runs: 0, wickets: 0, overs: 0, balls: 0 };
  const home = league.teams.find((t) => t.id === live.homeTeamId)!;
  const away = league.teams.find((t) => t.id === live.awayTeamId)!;
  return (
    <div className="panel">
      <div className="panel-header"><strong>Scoreboard</strong></div>
      <div className="panel-body">
        <div className="kv">
          <div className="key">Match</div><div className="value">{home.shortName} vs {away.shortName}</div>
          <div className="key">Status</div><div className="value">Innings {live.result.status === 'live' ? live.result.inning : ''}</div>
          <div className="key">{home.shortName}</div><div className="value">{a.runs}/{a.wickets} ({a.overs}.{a.balls % 6})</div>
          <div className="key">{away.shortName}</div><div className="value">{b.runs}/{b.wickets} ({b.overs}.{b.balls % 6})</div>
          {live.result.status === 'live' && live.result.inning === 2 && (
            <><div className="key">Target</div><div className="value">{(live.result as any).target}</div></>
          )}
        </div>
      </div>
    </div>
  );
}
