import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/hooks/useTheme';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const themeOptions: { value: Theme; label: string; icon: any }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-[1.1rem] w-[1.1rem] text-amber-500" />;
      case 'dark':
        return <Moon className="h-[1.1rem] w-[1.1rem] text-blue-400" />;
      default:
        return (
          <Monitor className="text-muted-foreground h-[1.1rem] w-[1.1rem]" />
        );
    }
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-muted text-foreground border-border bg-card focus:outline-hidden flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
        title="Switch theme"
        aria-label="Toggle theme"
      >
        {currentIcon()}
      </button>

      {isOpen && (
        <div className="border-border bg-popover text-popover-foreground absolute right-0 top-full z-50 mt-2 w-32 rounded-lg border p-1 shadow-lg ring-1 ring-black/5">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = theme === opt.value;

            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                  isActive
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{opt.label}</span>
                </div>
                {isActive && <Check className="text-primary h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
