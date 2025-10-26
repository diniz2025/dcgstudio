import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({ className, type, error, wrapperClassName, ...props }) => {
  const baseClasses = 'w-full bg-slate-700 text-white placeholder-slate-400 border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const typeClasses = type === 'file' 
    ? 'p-0 file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:bg-slate-600 file:text-slate-300 hover:file:bg-slate-500'
    : 'px-3 py-2';

  const errorClasses = error 
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
    : 'border-slate-600 focus:ring-orange-500 focus:border-orange-500';

  return (
    <div className={`w-full ${wrapperClassName}`}>
      <input
        type={type}
        className={`${baseClasses} ${typeClasses} ${errorClasses} ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};