
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: React.FC<SelectProps> = ({ className, children, ...props }) => {
  return (
    <select
      className={`w-full bg-slate-700 text-white border border-slate-600 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-colors px-3 py-2 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};