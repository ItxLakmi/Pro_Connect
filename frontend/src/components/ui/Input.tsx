'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground/70 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full glass px-4 py-3 rounded-xl outline-hidden
            focus:border-accent/50 focus:ring-4 focus:ring-accent/10
            transition-all placeholder:text-foreground/30
            ${error ? 'border-red-500/50 ring-4 ring-red-500/10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-400 ml-1">{error}</span>
      )}
    </div>
  );
};
