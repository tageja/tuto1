import React from 'react';
import { useApp } from './AppContext';
import { Search, Bell, ChevronDown, Sun, Moon, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TopBarProps {
  schoolName?: string;
  withSearch?: boolean;
  withSyncBadge?: boolean;
}

export function TopBar({ schoolName = 'Sunrise International School', withSearch = true, withSyncBadge = true }: TopBarProps) {
  const { language, setLanguage, theme, setTheme, t } = useApp();

  return (
    <div className="h-16 bg-card border-b border-border px-6 flex items-center gap-4">
      {/* School Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors">
          <span>{schoolName}</span>
          <ChevronDown size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>{schoolName}</DropdownMenuItem>
          <DropdownMenuItem>Greenfield Academy</DropdownMenuItem>
          <DropdownMenuItem>Join another school...</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search */}
      {withSearch && (
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder={t('search')}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Sync Badge */}
      {withSyncBadge && (
        <Badge variant="outline" className="gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          {t('syncedAgo')}
        </Badge>
      )}

      {/* Language Toggle */}
      <button
        onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Toggle language"
      >
        <div className="flex items-center gap-2">
          <Globe size={18} />
          <span className="text-sm">{language.toUpperCase()}</span>
        </div>
      </button>

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {/* Notifications */}
      <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
        <Bell size={18} />
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
      </button>

      {/* Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
