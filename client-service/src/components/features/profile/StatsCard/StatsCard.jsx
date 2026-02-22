import React, { memo } from 'react';
import { theme } from '../../../../utils/theme';

const StatsCard = memo(({ label, value, variant = 'orange' }) => (
  <div className={`p-6 bg-white rounded-xl border border-surface-border shadow-card ${theme.statsCard[variant] || theme.statsCard.orange}`}>
    <p className="text-4xl font-bold font-display">{value}</p>
    <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mt-2">{label}</p>
  </div>
));
StatsCard.displayName = 'StatsCard';
export default StatsCard;
