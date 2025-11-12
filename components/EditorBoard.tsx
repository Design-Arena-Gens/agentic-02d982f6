"use client";
import React, { useState } from 'react';
import type { LeagueState } from '@/lib/types';

export function EditorBoard({ league, setLeague }: { league: LeagueState; setLeague: React.Dispatch<React.SetStateAction<LeagueState>> }) {
  const [teamName, setTeamName] = useState('');
  const [shortName, setShortName] = useState('NEW');

  function addTeam() {
    const id = 't-' + Math.random().toString(36).slice(2, 7);
    const team = { id, name: teamName || 'New Team', shortName: shortName.slice(0,3).toUpperCase(), rating: 65, squad: [], lineup: [] };
    setLeague({
      ...league,
      teams: [...league.teams, team],
      standings: [...league.standings, { teamId: id, played: 0, won: 0, lost: 0, tied: 0, nrr: 0, points: 0 }],
    });
    setTeamName(''); setShortName('NEW');
  }

  function removeTeam(id: string) {
    setLeague({
      ...league,
      teams: league.teams.filter((t) => t.id !== id),
      standings: league.standings.filter((s) => s.teamId !== id),
      fixtures: league.fixtures.filter((f) => f.homeTeamId !== id && f.awayTeamId !== id),
    });
  }

  return (
    <div className="panel">
      <div className="panel-header"><strong>Editor</strong></div>
      <div className="panel-body">
        <div className="grid" style={{ gap: '.75rem' }}>
          <div className="panel">
            <div className="panel-header"><strong>Add Team</strong></div>
            <div className="panel-body" style={{ display: 'flex', gap: '.5rem' }}>
              <input placeholder="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
              <input placeholder="Short" value={shortName} onChange={(e) => setShortName(e.target.value)} />
              <button className="button" onClick={addTeam}>Add</button>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><strong>Teams</strong></div>
            <div className="panel-body">
              <table className="table">
                <thead><tr><th>Short</th><th>Name</th><th>Rating</th><th>Actions</th></tr></thead>
                <tbody>
                  {league.teams.map((t) => (
                    <tr key={t.id}>
                      <td>{t.shortName}</td>
                      <td>{t.name}</td>
                      <td>{t.rating}</td>
                      <td><button className="button danger" onClick={() => removeTeam(t.id)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
