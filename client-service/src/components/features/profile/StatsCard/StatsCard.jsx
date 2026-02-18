import React from 'react';

const StatsCard = ({ label, value, variant = 'orange' }) => {
  const variants = {
    orange: 'from-orange-50 to-white border-orange-100 text-orange-600',
    blue: 'from-blue-50 to-white border-blue-100 text-blue-600',
    purple: 'from-purple-50 to-white border-purple-100 text-purple-600'
  };

  return (
    <div className={`p-6 bg-gradient-to-br ${variants[variant]} rounded-2xl border shadow-sm transition-all hover:scale-[1.02]`}>
      <p className="text-4xl font-black">{value}</p>
      <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mt-2">{label}</p>
    </div>
  );
};

export default StatsCard;
