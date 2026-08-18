import React from 'react';

export interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color, subtitle, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''
      }`}
    >
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 overflow-hidden">
        <h4 className="text-text-secondary text-sm font-medium truncate mb-1">{title}</h4>
        <div className="text-2xl font-bold text-text-primary leading-tight">{value}</div>
        {subtitle && <p className="text-xs text-text-secondary mt-1 truncate">{subtitle}</p>}
      </div>
    </div>
  );
};

export default DashboardCard;
