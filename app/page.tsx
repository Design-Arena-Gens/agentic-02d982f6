"use client";
import { useMemo, useState } from 'react';
import { Tabs } from '@/components/Tabs';
import { Simulator } from '@/components/Simulator';
import { Scoreboard } from '@/components/Scoreboard';
import { FixtureBoard } from '@/components/FixtureBoard';
import { StandingsBoard } from '@/components/StandingsBoard';
import { RecordsBoard } from '@/components/RecordsBoard';
import { StatsBoard } from '@/components/StatsBoard';
import { LineupsBoard } from '@/components/LineupsBoard';
import { EditorBoard } from '@/components/EditorBoard';
import { SettingsBoard } from '@/components/SettingsBoard';
import { defaultLeague } from '@/data/mock';
import type { LeagueState, MatchConfig } from '@/lib/types';

const TABS = [
  'home',
  'fixtures',
  'standing',
  'records',
  'stats',
  'lineups & squad',
  'editor',
  'setting',
] as const;

type TabKey = typeof TABS[number];

export default function Page() {
  const [active, setActive] = useState<TabKey>('home');
  const [league, setLeague] = useState<LeagueState>(() => defaultLeague());
  const [matchConfig, setMatchConfig] = useState<MatchConfig>({ oversPerInnings: 5, simSpeed: 1 });

  const tabItems = useMemo(() => TABS.map((t) => ({ key: t, label: t })), []);

  return (
    <div className="grid" style={{ gap: '1rem' }}>
      <div className="panel">
        <div className="panel-header" style={{ gap: '1rem' }}>
          <Tabs items={tabItems} activeKey={active} onChange={(k) => setActive(k as TabKey)} />
          <div className="controls" style={{ marginLeft: 'auto' }}>
            <span className="badge">Overs/Innings: {matchConfig.oversPerInnings}</span>
            <input
              aria-label="overs"
              type="range"
              min={1}
              max={20}
              value={matchConfig.oversPerInnings}
              onChange={(e) => setMatchConfig((c) => ({ ...c, oversPerInnings: Number(e.target.value) }))}
            />
            <span className="badge">Speed?{matchConfig.simSpeed}</span>
            <input
              aria-label="speed"
              type="range"
              min={0.5}
              max={4}
              step={0.5}
              value={matchConfig.simSpeed}
              onChange={(e) => setMatchConfig((c) => ({ ...c, simSpeed: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className="panel-body">
          {active === 'home' && (
            <div className="grid cols-2">
              <div className="grid" style={{ gap: '.75rem' }}>
                <Simulator league={league} setLeague={setLeague} matchConfig={matchConfig} />
              </div>
              <div className="grid" style={{ gap: '.75rem' }}>
                <Scoreboard league={league} />
              </div>
            </div>
          )}
          {active === 'fixtures' && <FixtureBoard league={league} setLeague={setLeague} />}
          {active === 'standing' && <StandingsBoard league={league} />}
          {active === 'records' && <RecordsBoard league={league} />}
          {active === 'stats' && <StatsBoard league={league} />}
          {active === 'lineups & squad' && (
            <LineupsBoard league={league} setLeague={setLeague} />
          )}
          {active === 'editor' && <EditorBoard league={league} setLeague={setLeague} />}
          {active === 'setting' && (
            <SettingsBoard matchConfig={matchConfig} setMatchConfig={setMatchConfig} />
          )}
        </div>
      </div>
    </div>
  );
}
