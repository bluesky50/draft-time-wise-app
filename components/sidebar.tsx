
'use client';

import { SidebarNav } from './sidebar-nav';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const storedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (storedCollapsed) {
      setIsCollapsed(JSON.parse(storedCollapsed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    document.body.dataset.sidebarCollapsed = String(isCollapsed);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <TooltipProvider>
        <div className="flex-1 p-2 space-y-4 overflow-y-auto">
            <SidebarNav isCollapsed={isCollapsed} />
        </div>
        <div className="border-t p-2">
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                     <Button
                        onClick={toggleSidebar}
                        variant="ghost"
                        className="w-full justify-center"
                        >
                        <ChevronLeft className={cn("h-6 w-6 transition-transform", isCollapsed && "rotate-180")} />
                        <span className="sr-only">{isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    {isCollapsed ? 'Expand' : 'Collapse'}
                </TooltipContent>
            </Tooltip>
        </div>
      </TooltipProvider>
    </aside>
  );
}
