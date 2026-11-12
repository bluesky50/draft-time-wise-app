
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { SidebarNav } from './sidebar-nav';
import { AnimatePresence, motion } from 'framer-motion';
import { TooltipProvider } from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';

export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="fixed top-4 left-4 z-50">
        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-14 h-14 shadow-lg"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle Navigation</span>
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r shadow-xl"
          >
            <ScrollArea className="h-full">
              <div className="p-2 pt-20 h-full">
                <SidebarNav isCollapsed={false} />
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
