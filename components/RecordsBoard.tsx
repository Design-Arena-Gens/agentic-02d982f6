"use client";
import React from 'react';
import type { LeagueState } from '@/lib/types';

export function RecordsBoard({ league }: { league: LeagueState }) {
  const r = league.records;
  return (
    <div className="panel">
      <div className="panel-header"><strong>Records</strong></div>
      <div className="panel-body">
        <div className="kv">
          <div className="key">Highest Team Total</div>
          <div className="value">{r.highestTeamTotal ? `${r.highestTeamTotal.runs} by ${league.teams.find(t=>t.id===r.highestTeamTotal!.teamId)!.shortName}` : '?'}</div>
          <div className="key">Best Bowling</div>
          <div className="value">{r.bestBowling ? `${r.bestBowling.wickets}/${r.bestBowling.runs}` : '?'}</div>
          <div className="key">Highest Individual Score</div>
          <div className="value">{r.highestIndividualScore ? `${r.highestIndividualScore.runs}` : '?'}</div>
        </div>
      </div>
    </div>
  );
}
