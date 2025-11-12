"use client";
import React from 'react';
import type { LeagueState } from '@/lib/types';

export function StandingsBoard({ league }: { league: LeagueState }) {
  return (
    <div className="panel">
      <div className="panel-header"><strong>Standings</strong></div>
      <div className="panel-body">
        <table className="table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>L</th>
              <th>T</th>
              <th>NRR</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {league.standings.map((s, idx) => {
              const team = league.teams.find((t) => t.id === s.teamId)!;
              return (
                <tr key={s.teamId}>
                  <td>{idx + 1}</td>
                  <td>{team.shortName}</td>
                  <td>{s.played}</td>
                  <td>{s.won}</td>
                  <td>{s.lost}</td>
                  <td>{s.tied}</td>
                  <td>{s.nrr.toFixed(2)}</td>
                  <td>{s.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
