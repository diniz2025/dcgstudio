import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    wrapperClassName?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ className, error, wrapperClassName, ...props }) => {
  const errorClasses = error 
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
    : 'border-slate-600 focus:ring-orange-500 focus:border-orange-500';
    
  return (
    <div className={`w-full ${wrapperClassName}`}>
      <textarea
        className={`w-full bg-slate-700 text-white placeholder-slate-400 border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 ${errorClasses} ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};