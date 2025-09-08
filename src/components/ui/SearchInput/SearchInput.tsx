import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../Input';
import { Button } from '../Button';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  className,
}) => {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      leftIcon={<Search className="h-4 w-4" />}
      rightIcon={
        value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        )
      }
      className={className}
    />
  );
};

export { SearchInput };
