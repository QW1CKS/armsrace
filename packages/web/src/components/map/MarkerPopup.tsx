import React from 'react';
import { severityColor } from '../../styles/tokens.js';
import { relativeTime } from '@armsrace/shared';

interface PopupData {
  id: string;
  title: string;
  category: string;
  severity: number;
  confidence: number;
  source?: string;
  country?: string;
  publishedAt: string;
  body?: string;
}

interface MarkerPopupProps {
  data: PopupData;
}

export function MarkerPopup({ data }: MarkerPopupProps) {
  const color = severityColor(data.severity);
  const timeAgo = relativeTime(new Date(data.publishedAt));

  return (
    <div style={{
      minWidth: '220px',
      maxWidth: '280px',
      fontFamily: 'inherit',
      fontSize: '12px',
      color: '#cdd6f4',
    }}>
      {/* Category + severity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: '10px', textTransform: 'uppercase', color, fontWeight: 600, letterSpacing: '0.05em' }}>
          {data.category}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#6c7086' }}>{timeAgo}</span>
      </div>

      {/* Title */}
      <div style={{ fontWeight: 600, lineHeight: 1.4, marginBottom: '6px', color: '#cdd6f4' }}>
        {data.title}
      </div>

      {/* Body */}
      {data.body && (
        <div style={{ color: '#a6adc8', lineHeight: 1.5, marginBottom: '8px', fontSize: '11px' }}>
          {data.body.slice(0, 140)}{data.body.length > 140 ? '…' : ''}
        </div>
      )}

      {/* Meta row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #313244', paddingTop: '6px' }}>
        <span style={{ color: '#6c7086' }}>Severity:</span>
        <span style={{ color }}>{data.severity}</span>
        {data.country && (
          <>
            <span style={{ color: '#6c7086' }}>·</span>
            <span style={{ color: '#cdd6f4' }}>{data.country}</span>
          </>
        )}
        {data.source && (
          <>
            <span style={{ color: '#6c7086' }}>·</span>
            <span style={{ color: '#a6adc8' }}>{data.source}</span>
          </>
        )}
      </div>
    </div>
  );
}
