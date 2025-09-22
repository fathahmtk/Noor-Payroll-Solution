import React from 'react';

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ title, icon, subtitle, actions, children, className = '', contentClassName = '', noPadding = false }) => {
  return (
    <div className={`bg-card rounded-xl border border-border shadow-sm flex flex-col ${className}`}>
      <div className={`flex justify-between items-start ${noPadding ? 'p-6 pb-2' : 'p-6'}`}>
        <div className="flex items-center">
            {icon && <div className="mr-3 text-muted-foreground">{icon}</div>}
            <div>
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
      <div className={`flex-1 ${!noPadding ? 'px-6 pb-6' : ''} ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;