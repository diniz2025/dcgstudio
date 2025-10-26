
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-lg ${className}`} {...props}>
      {children}
    </div>
  );
};