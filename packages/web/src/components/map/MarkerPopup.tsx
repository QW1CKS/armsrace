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
      minWidth: '210px',
      maxWidth: '280px',
      fontSize: '12px',
      color: 'var(--text-primary)',
    }}>
      {/* Category + severity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{
          display: 'inline-block',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: '10px', textTransform: 'capitalize', color, fontWeight: 600 }}>
          {data.category.replace(/_/g, ' ')}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)' }}>{timeAgo}</span>
      </div>

      {/* Title */}
      <div style={{ fontWeight: 600, lineHeight: 1.4, marginBottom: '6px', color: 'var(--text-primary)', fontSize: '12px' }}>
        {data.title}
      </div>

      {/* Body */}
      {data.body && (
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px', fontSize: '11px' }}>
          {data.body.slice(0, 140)}{data.body.length > 140 ? '…' : ''}
        </div>
      )}

      {/* Meta row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', fontSize: '10px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Sev:</span>
        <span style={{ color }}>{data.severity}</span>
        {data.country && (
          <>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ color: 'var(--text-primary)' }}>{data.country}</span>
          </>
        )}
        {data.source && (
          <>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ color: 'var(--text-secondary)' }}>{data.source}</span>
          </>
        )}
      </div>
    </div>
  );
}
