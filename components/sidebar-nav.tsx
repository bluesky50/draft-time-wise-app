'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { quickLinks, allLinks } from '@/config/nav';
import { NavLink } from '@/components/nav-link';

interface SidebarNavProps {
  isCollapsed: boolean;
}

export function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedLinks = useMemo(() => {
    return [...allLinks].sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const filteredLinks = useMemo(() => {
    if (!searchTerm) {
      return sortedLinks;
    }
    return sortedLinks.filter(link =>
      link.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, sortedLinks]);

  return (
    <div className="flex flex-col h-full">
      <Link href="/" className={cn("text-2xl font-bold font-headline text-primary mb-4 px-2 pt-2", isCollapsed && "text-center")}>
        {isCollapsed ? 'TW' : 'TimeWise'}
      </Link>
      
      {!isCollapsed && (
        <div className="px-2 mb-4">
            <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search pages..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
        </div>
      )}
      
      <nav className="flex-1 space-y-4">
        <div>
            {!isCollapsed && <h3 className="px-2 mb-1 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Quick Links</h3>}
            <ul className="space-y-1">
              {quickLinks.map(link => <NavLink key={link.href} {...link} isCollapsed={isCollapsed} />)}
            </ul>
        </div>

        <Separator />
        
        <div>
            {!isCollapsed && <h3 className="px-2 mb-1 text-xs font-semibold text-muted-foreground tracking-wider uppercase">All Pages</h3>}
             {filteredLinks.length > 0 ? (
                <ul className="space-y-1">
                  {filteredLinks.map(link => <NavLink key={link.href} {...link} isCollapsed={isCollapsed} />)}
                </ul>
             ) : (
                !isCollapsed && <p className="px-4 text-sm text-muted-foreground">No pages found.</p>
             )}
        </div>
      </nav>
    </div>
  );
}
