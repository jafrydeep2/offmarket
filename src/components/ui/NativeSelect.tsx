import React from 'react';
import { cn } from '@/lib/utils';

interface NativeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const NativeSelect: React.FC<NativeSelectProps> = ({
  value,
  onValueChange,
  children,
  className,
  placeholder,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange(e.target.value);
  };

  return (
    <div className="relative">
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
          "border-2 border-gray-200 dark:border-gray-700 focus:border-primary transition-colors",
          className
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

interface NativeSelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const NativeSelectItem: React.FC<NativeSelectItemProps> = ({
  value,
  children,
  disabled = false
}) => {
  return (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  );
};
