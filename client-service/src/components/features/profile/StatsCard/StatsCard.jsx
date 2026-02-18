import React, { memo } from 'react';
import { theme } from '../../../../utils/theme';

const StatsCard = memo(({ label, value, variant = 'orange' }) => (
  <div className={`p-6 bg-gradient-to-br ${theme.statsCard[variant] || theme.statsCard.orange} rounded-2xl border shadow-sm transition-all hover:scale-[1.02]`}>
    <p className="text-4xl font-black">{value}</p>
    <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mt-2">{label}</p>
  </div>
));
StatsCard.displayName = 'StatsCard';
export default StatsCard;
