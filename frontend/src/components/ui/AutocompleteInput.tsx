'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AutocompleteInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  error?: string;
  /** Max suggestions shown in the dropdown */
  maxSuggestions?: number;
  /** If true, the dropdown shows all suggestions when focused (before typing) */
  showAllOnFocus?: boolean;
}

export const AutocompleteInput = ({
  label,
  placeholder,
  value,
  onChange,
  suggestions,
  error,
  maxSuggestions = 8,
  showAllOnFocus = false,
}: AutocompleteInputProps) => {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on current value
  const filtered = suggestions
    .filter((s) => {
      if (!value.trim() && showAllOnFocus) return true;
      return s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase();
    })
    .slice(0, maxSuggestions);

  const isOpen = open && filtered.length > 0;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = useCallback(
    (val: string) => {
      onChange(val);
      setOpen(false);
      setHighlighted(-1);
      inputRef.current?.blur();
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') { setOpen(true); setHighlighted(0); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlighted >= 0) select(filtered[highlighted]);
        else setOpen(false);
        break;
      case 'Escape':
        setOpen(false);
        setHighlighted(-1);
        break;
      case 'Tab':
        if (highlighted >= 0) { e.preventDefault(); select(filtered[highlighted]); }
        else setOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="w-full space-y-2 relative">
      {label && (
        <label className="text-sm font-medium text-foreground/70 ml-1">{label}</label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlighted(-1); }}
          onFocus={() => { setOpen(true); setHighlighted(-1); }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className={`
            w-full glass px-4 py-3 pr-10 rounded-xl outline-none
            focus:border-accent/50 focus:ring-4 focus:ring-accent/10
            transition-all placeholder:text-foreground/30
            ${error ? 'border-red-500/50 ring-4 ring-red-500/10' : ''}
          `}
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 transition-transform duration-200 pointer-events-none ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-[200] mt-1 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-56 overflow-y-auto"
          >
            {filtered.map((s, i) => (
              <li
                key={s}
                onMouseDown={(e) => { e.preventDefault(); select(s); }}
                onMouseEnter={() => setHighlighted(i)}
                className={`
                  px-4 py-2.5 cursor-pointer text-sm transition-colors
                  ${i === highlighted ? 'bg-accent/20 text-accent' : 'hover:bg-white/5 text-foreground/80'}
                `}
              >
                {/* Bold the matching portion */}
                {highlightMatch(s, value)}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && <span className="text-xs text-red-400 ml-1">{error}</span>}
    </div>
  );
};

/** Renders the suggestion with the matching substring bolded */
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span className="font-bold text-accent">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </span>
  );
}
