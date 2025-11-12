"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { LeagueState, MatchConfig, Match } from '@/lib/types';
import { stepMatch } from '@/lib/engine';
import { applyCompletedMatch } from '@/lib/standings';

export function Simulator({ league, setLeague, matchConfig }: { league: LeagueState; setLeague: React.Dispatch<React.SetStateAction<LeagueState>>; matchConfig: MatchConfig }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [liveFrames, setLiveFrames] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [seed, setSeed] = useState(() => String(Date.now()));
  const [ballPtr, setBallPtr] = useState(0);

  const pickNextMatch = useCallback(() => {
    const next = league.fixtures.find((m) => m.result.status === 'scheduled');
    return next ?? null;
  }, [league.fixtures]);

  const startNextMatch = useCallback(() => {
    const next = pickNextMatch();
    if (!next) return;
    const live: Match = { ...next, result: { status: 'live', inning: 1 } } as Match;
    setCurrentMatch(live);
    setLiveFrames([]);
    setBallPtr(0);
    setIsRunning(true);
  }, [pickNextMatch]);

  const stop = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => currentMatch && setIsRunning(true), [currentMatch]);
  const resetSeed = useCallback(() => setSeed(String(Date.now())), []);

  useEffect(() => {
    let raf = 0;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const context = ctx as CanvasRenderingContext2D;
    let t = 0;

    function drawPitch() {
      const { canvas } = context;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#0a3d2e';
      context.fillRect(0, 0, canvas.width, canvas.height);
      const pitchW = canvas.width * 0.18;
      const pitchH = canvas.height * 0.65;
      const x = canvas.width / 2 - pitchW / 2;
      const y = canvas.height / 2 - pitchH / 2;
      context.fillStyle = '#c2b280';
      context.fillRect(x, y, pitchW, pitchH);
      context.fillStyle = '#fff';
      context.fillRect(x + pitchW / 2 - 2, y + 8, 4, 18);
      context.fillRect(x + pitchW / 2 - 2, y + pitchH - 26, 4, 18);
    }

    function drawFrame(frame: any, progress: number) {
      const { canvas } = context;
      const path = frame.visual.path;
      const pts = path.map((p: any) => ({ x: p.x * canvas.width, y: p.y * canvas.height }));
      // simple quadratic interpolation across the 4 nodes
      const idx = Math.min(2, Math.floor(progress * 3));
      const localT = (progress * 3) - idx;
      const a = pts[idx];
      const b = pts[idx + 1];
      const x = a.x + (b.x - a.x) * localT;
      const y = a.y + (b.y - a.y) * localT;
      context.fillStyle = frame.visual.color;
      context.beginPath();
      context.arc(x, y, 6, 0, Math.PI * 2);
      context.fill();
    }

    function loop(ts: number) {
      if (!isRunning || liveFrames.length === 0) {
        drawPitch();
      } else {
        const speed = Math.max(0.2, Math.min(4, matchConfig.simSpeed));
        t += (speed * 0.02);
        if (t > 1) t = 1;
        drawPitch();
        const frame = liveFrames[liveFrames.length - 1];
        drawFrame(frame, t);
        if (t >= 1) {
          t = 0;
          setBallPtr((v) => v + 1);
        }
      }
      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isRunning, liveFrames, matchConfig.simSpeed]);

  useEffect(() => {
    if (!isRunning || !currentMatch) return;
    if (ballPtr === 0 && liveFrames.length === 0) {
      // kick first ball frame
      const { frames, completed, match } = stepMatch(currentMatch, { oversPerInnings: 1, simSpeed: 1 }, seed + ':peek');
      setLiveFrames((f) => [...f, frames[0]]);
      return;
    }
    const maxBalls = matchConfig.oversPerInnings * 6;
    if (ballPtr >= maxBalls) {
      // switch innings or complete
      if (currentMatch.result.status === 'live' && currentMatch.result.inning === 1) {
        const { frames, completed, match } = stepMatch(currentMatch, matchConfig, seed + ':step1');
        // frames simulate full inning 1, we already showed some anim; just update match to inning 2
        setCurrentMatch(match);
        setLiveFrames([]);
        setBallPtr(0);
      } else {
        const { frames, completed, match } = stepMatch(currentMatch, matchConfig, seed + ':step2');
        setCurrentMatch(match);
        setLiveFrames([]);
        setBallPtr(0);
        setIsRunning(false);
        if (match.result.status === 'completed') {
          setLeague((l) => applyCompletedMatch(l, match));
        }
      }
      return;
    }
    // generate the next ball frame to animate
    const { frames } = stepMatch(currentMatch, { oversPerInnings: currentMatch.result.status === 'live' && currentMatch.result.inning === 1 ? 1 : 1, simSpeed: 1 }, seed + ':animate' + ballPtr);
    const frame = frames[Math.min(ballPtr, frames.length - 1)] ?? frames[0];
    setLiveFrames((f) => [...f, frame]);
  }, [ballPtr, isRunning, currentMatch, matchConfig, seed, setLeague]);

  const homeTeam = currentMatch && league.teams.find((t) => t.id === currentMatch.homeTeamId)?.shortName;
  const awayTeam = currentMatch && league.teams.find((t) => t.id === currentMatch.awayTeamId)?.shortName;

  return (
    <div className="panel">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <strong>2D Simulation</strong>
          <span className="badge">{homeTeam ?? '?'} vs {awayTeam ?? '?'}</span>
        </div>
        <div className="controls">
          <button className="button" onClick={startNextMatch}>Sim Next Match</button>
          <button className="button secondary" onClick={isRunning ? stop : resume}>{isRunning ? 'Pause' : 'Resume'}</button>
          <button className="button secondary" onClick={resetSeed}>Shuffle Seed</button>
        </div>
      </div>
      <div className="panel-body">
        <div className="canvas-wrap">
          <canvas ref={canvasRef} width={680} height={400} />
        </div>
      </div>
    </div>
  );
}
