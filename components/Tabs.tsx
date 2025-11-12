"use client";
import React from 'react';

export type TabItem = { key: string; label: string };

export function Tabs({ items, activeKey, onChange }: { items: TabItem[]; activeKey: string; onChange: (key: string) => void }) {
  return (
    <nav className="tabs">
      {items.map((it) => (
        <button
          key={it.key}
          className={`tab ${activeKey === it.key ? 'active' : ''}`}
          onClick={() => onChange(it.key)}
        >
          {it.label}
        </button>
      ))}
    </nav>
  );
}
