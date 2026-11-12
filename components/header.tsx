
'use client';

import { Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from '@/components/settings-dialog';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { SidebarNav } from './sidebar-nav';
import { TooltipProvider } from './ui/tooltip';


export function Header() {
  return (
    <header className="flex h-16 items-center justify-between px-4 border-b bg-card lg:justify-end">
       <div className="lg:hidden">
         <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Main application navigation links.</SheetDescription>
                </SheetHeader>
              <TooltipProvider>
                <SidebarNav isCollapsed={false} />
              </TooltipProvider>
            </SheetContent>
          </Sheet>
       </div>
       <div className='flex-1 lg:hidden' />
      <SettingsDialog>
        <Button variant="ghost" size="icon">
          <Settings className="h-6 w-6" />
          <span className="sr-only">Settings</span>
        </Button>
      </SettingsDialog>
    </header>
  );
}
