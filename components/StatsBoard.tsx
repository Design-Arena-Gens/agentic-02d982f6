"use client";
import React from 'react';
import type { LeagueState } from '@/lib/types';

export function StatsBoard({ league }: { league: LeagueState }) {
  return (
    <div className="panel">
      <div className="panel-header"><strong>Stats</strong></div>
      <div className="panel-body">
        <p>Season aggregates (simplified demo):</p>
        <ul>
          {league.teams.map((t) => (
            <li key={t.id}><span className="badge">{t.shortName}</span> Rating {t.rating}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
