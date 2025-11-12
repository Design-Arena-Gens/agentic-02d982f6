"use client";
import React from 'react';
import type { LeagueState, Team } from '@/lib/types';

export function LineupsBoard({ league, setLeague }: { league: LeagueState; setLeague: React.Dispatch<React.SetStateAction<LeagueState>> }) {
  function toggleInLineup(team: Team, playerId: string) {
    const inXI = team.lineup.includes(playerId);
    const nextXI = inXI ? team.lineup.filter((id) => id !== playerId) : [...team.lineup, playerId].slice(0, 11);
    setLeague({
      ...league,
      teams: league.teams.map((t) => (t.id === team.id ? { ...t, lineup: nextXI } : t)),
    });
  }
  return (
    <div className="panel">
      <div className="panel-header"><strong>Lineups & Squad</strong></div>
      <div className="panel-body">
        <div className="grid cols-2">
          {league.teams.map((team) => (
            <div key={team.id} className="panel">
              <div className="panel-header"><strong>{team.name}</strong> <span className="badge">XI {team.lineup.length}/11</span></div>
              <div className="panel-body">
                <table className="table">
                  <thead><tr><th>Player</th><th>Role</th><th>Bat</th><th>Bowl</th><th>XI</th></tr></thead>
                  <tbody>
                    {team.squad.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.role}</td>
                        <td>{p.batting}</td>
                        <td>{p.bowling}</td>
                        <td>
                          <button className={`button ${team.lineup.includes(p.id) ? '' : 'secondary'}`} onClick={() => toggleInLineup(team, p.id)}>
                            {team.lineup.includes(p.id) ? 'In XI' : 'Add'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
