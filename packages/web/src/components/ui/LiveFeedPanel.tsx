import React, { useState } from 'react';

/* ── Curated geopolitics / news live-stream channels ───────── */
interface LiveChannel {
  id: string;
  name: string;
  channelId: string;
  tag: string;
  color: string;
}

const LIVE_CHANNELS: LiveChannel[] = [
  { id: 'sky',      name: 'Sky News',         channelId: 'UCQGqX5Ndpm4snE0NTjyOJnA', tag: 'UK',     color: '#e44' },
  { id: 'aj',       name: 'Al Jazeera',       channelId: 'UCNye-wNBqNL5ZzHSJj3l8Bg', tag: 'MENA',   color: '#f5a623' },
  { id: 'f24',      name: 'France 24',        channelId: 'UCQfwfsi5VrQ8yKZ-UWmAEFg', tag: 'EU',     color: '#38bdf8' },
  { id: 'dw',       name: 'DW News',          channelId: 'UCknLrEdhRCp1aegoMqRaCZg', tag: 'DE',     color: '#4ade80' },
  { id: 'wion',     name: 'WION',             channelId: 'UC_gUM8rL-Lrg6O3adPW9K1g', tag: 'IN',     color: '#fbbf24' },
  { id: 'nbc',      name: 'NBC News',         channelId: 'UCeY0bbntWzzVIaj2z3QigXg', tag: 'US',     color: '#818cf8' },
  { id: 'abc',      name: 'ABC News',         channelId: 'UCBi2mrWuNuyYy4gbM6fU18Q', tag: 'US',     color: '#a78bfa' },
  { id: 'cbs',      name: 'CBS News',         channelId: 'UC8p1vwvWtl6T73JiExfWs1g', tag: 'US',     color: '#22d3ee' },
  { id: 'reuters',  name: 'Reuters',          channelId: 'UChqUTb7kYRX8-EiaN3XFrSQ', tag: 'INTL',   color: '#fb7185' },
  { id: 'cna',      name: 'CNA',              channelId: 'UCo8bcnLyZH8tBIH9V1mLgqQ', tag: 'APAC',   color: '#34d399' },
];

export function LiveFeedPanel() {
  const [activeChannel, setActiveChannel] = useState<LiveChannel>(LIVE_CHANNELS[0]);
  const [playerExpanded, setPlayerExpanded] = useState(false);

  const embedUrl = `https://www.youtube.com/embed/live_stream?channel=${activeChannel.channelId}&autoplay=1&mute=1&modestbranding=1&rel=0&controls=1`;

  return (
    <div className="widget-card live-feed-card">
      <div className="widget-header">
        <span className="widget-label">Live Feed</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="live-dot" />
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-danger)', fontWeight: 600, letterSpacing: '0.05em' }}>
            LIVE
          </span>
          <button
            className="live-expand-btn"
            onClick={() => setPlayerExpanded(!playerExpanded)}
            title={playerExpanded ? 'Collapse player' : 'Expand player'}
          >
            {playerExpanded ? '▾' : '▴'}
          </button>
        </div>
      </div>

      {/* Embedded YouTube Player */}
      <div className={`live-player-wrap${playerExpanded ? ' expanded' : ''}`}>
        <iframe
          key={activeChannel.id}
          src={embedUrl}
          className="live-player-iframe"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={`${activeChannel.name} Live`}
        />
        <div className="live-player-label">
          <span style={{ color: activeChannel.color, fontWeight: 600 }}>{activeChannel.name}</span>
          <span className="live-player-tag" style={{ borderColor: activeChannel.color, color: activeChannel.color }}>
            {activeChannel.tag}
          </span>
        </div>
      </div>

      {/* Channel List */}
      <div className="live-channel-list">
        {LIVE_CHANNELS.map((ch) => (
          <button
            key={ch.id}
            className={`live-channel-btn${activeChannel.id === ch.id ? ' active' : ''}`}
            onClick={() => setActiveChannel(ch)}
          >
            <span
              className="live-channel-dot"
              style={{ background: ch.color, boxShadow: activeChannel.id === ch.id ? `0 0 8px ${ch.color}` : 'none' }}
            />
            <span className="live-channel-name">{ch.name}</span>
            <span className="live-channel-tag" style={{ color: ch.color }}>{ch.tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
