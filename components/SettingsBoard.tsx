"use client";
import React from 'react';
import type { MatchConfig } from '@/lib/types';

export function SettingsBoard({ matchConfig, setMatchConfig }: { matchConfig: MatchConfig; setMatchConfig: (c: MatchConfig) => void }) {
  return (
    <div className="panel">
      <div className="panel-header"><strong>Settings</strong></div>
      <div className="panel-body">
        <div className="grid" style={{ gap: '.75rem', maxWidth: 520 }}>
          <label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '.75rem' }}>
            <span>Overs per innings</span>
            <input type="number" min={1} max={20} value={matchConfig.oversPerInnings} onChange={(e) => setMatchConfig({ ...matchConfig, oversPerInnings: Math.max(1, Math.min(20, Number(e.target.value))) })} />
          </label>
          <label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '.75rem' }}>
            <span>Simulation speed</span>
            <input type="number" step={0.5} min={0.5} max={4} value={matchConfig.simSpeed} onChange={(e) => setMatchConfig({ ...matchConfig, simSpeed: Math.max(0.5, Math.min(4, Number(e.target.value))) })} />
          </label>
        </div>
      </div>
    </div>
  );
}
