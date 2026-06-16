'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface LocationComboboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const SRI_LANKAN_LOCATIONS = [
  'Colombo, Sri Lanka',
  'Gampaha, Sri Lanka',
  'Kalutara, Sri Lanka',
  'Matara, Sri Lanka',
  'Galle, Sri Lanka',
  'Hambantota, Sri Lanka',
  'Jaffna, Sri Lanka',
  'Mullaitivu, Sri Lanka',
  'Batticaloa, Sri Lanka',
  'Ampara, Sri Lanka',
  'Trincomalee, Sri Lanka',
  'Kurunegala, Sri Lanka',
  'Puttalam, Sri Lanka',
  'Anuradhapura, Sri Lanka',
  'Polonnaruwa, Sri Lanka',
  'Kandy, Sri Lanka',
  'Nuwara Eliya, Sri Lanka',
  'Badulla, Sri Lanka',
  'Monaragala, Sri Lanka',
  'Ratnapura, Sri Lanka',
  'Kegalle, Sri Lanka',
  'Vavuniya, Sri Lanka',
  'Mannar, Sri Lanka',
  'Remote',
];

export const LocationCombobox = React.forwardRef<HTMLInputElement, LocationComboboxProps>(
  (
    {
      label,
      error,
      value = '',
      onChange,
      onBlur,
      placeholder = 'Select or type a location...',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value as string);
    const [filteredOptions, setFilteredOptions] = useState(SRI_LANKAN_LOCATIONS);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const internalRef = useRef<HTMLInputElement>(null);

    const inputRef = ref || internalRef;

    useEffect(() => {
      setInputValue(value as string);
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      
      // Call the onChange from react-hook-form
      onChange?.(e);

      // Filter locations based on input
      if (newValue.trim()) {
        const filtered = SRI_LANKAN_LOCATIONS.filter((location) =>
          location.toLowerCase().includes(newValue.toLowerCase())
        );
        setFilteredOptions(filtered.length > 0 ? filtered : SRI_LANKAN_LOCATIONS);
      } else {
        setFilteredOptions(SRI_LANKAN_LOCATIONS);
      }

      setIsOpen(true);
    };

    const handleSelectOption = (option: string) => {
      setInputValue(option);
      const syntheticEvent = {
        type: 'change',
        target: { name: props.name, value: option }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
      setIsOpen(false);
      
      const syntheticBlurEvent = {
        type: 'blur',
        target: { name: props.name }
      } as unknown as React.FocusEvent<HTMLInputElement>;
      onBlur?.(syntheticBlurEvent);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault();
      setInputValue('');
      const syntheticEvent = {
        type: 'change',
        target: { name: props.name, value: '' }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
      if (typeof inputRef === 'object' && inputRef?.current) {
        inputRef.current.focus();
      }
    };

    const handleInputFocus = () => {
      setIsOpen(true);
    };

    return (
      <div ref={wrapperRef} className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground/70 ml-1">
            {label}
          </label>
        )}
        <div className="relative z-50">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={onBlur}
              placeholder={placeholder}
              autoComplete="off"
              className={`
                w-full glass px-4 py-3 pr-10 rounded-xl outline-none
                focus:border-accent/50 focus:ring-4 focus:ring-accent/10
                transition-all placeholder:text-foreground/30
                ${error ? 'border-red-500/50 ring-4 ring-red-500/10' : ''}
              `}
              {...props}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              {inputValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-foreground/40 hover:text-foreground/70 transition-colors p-1 pointer-events-auto"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <ChevronDown
                className={`w-4 h-4 text-foreground/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </div>

          {/* Dropdown Options */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background/98 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl z-[9999] max-h-64 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`
                      w-full px-4 py-3 text-left text-sm transition-colors
                      hover:bg-accent/10 border-b border-white/5 last:border-b-0
                      ${inputValue === option ? 'bg-accent/20 text-accent font-medium' : 'text-foreground/70 hover:text-foreground'}
                    `}
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-foreground/40">
                  No locations found. Use your custom location.
                </div>
              )}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs text-red-400 ml-1">{error}</span>
        )}
      </div>
    );
  }
);

LocationCombobox.displayName = 'LocationCombobox';
