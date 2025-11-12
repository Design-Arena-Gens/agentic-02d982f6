"use client";
import React from 'react';
import type { LeagueState, Match } from '@/lib/types';

export function FixtureBoard({ league, setLeague }: { league: LeagueState; setLeague: React.Dispatch<React.SetStateAction<LeagueState>> }) {
  return (
    <div className="panel">
      <div className="panel-header"><strong>Fixtures</strong></div>
      <div className="panel-body">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Home</th>
              <th>Away</th>
              <th>Scheduled</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {league.fixtures.map((m, idx) => {
              const home = league.teams.find((t) => t.id === m.homeTeamId)!;
              const away = league.teams.find((t) => t.id === m.awayTeamId)!;
              return (
                <tr key={m.id}>
                  <td>{idx + 1}</td>
                  <td>{home.shortName}</td>
                  <td>{away.shortName}</td>
                  <td>{new Date(m.scheduledAt).toLocaleDateString()}</td>
                  <td>{m.result.status === 'completed' ? `Completed: ${m.result.margin}` : m.result.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
