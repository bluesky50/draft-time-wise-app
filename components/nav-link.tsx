'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { NavLinkInfo } from '@/config/nav';

interface NavLinkProps extends NavLinkInfo {
  isCollapsed: boolean;
}

export function NavLink({ href, label, icon: Icon, isCollapsed }: NavLinkProps) {
  const pathname = usePathname();

  return (
    <li>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant={pathname === href ? 'secondary' : 'ghost'}
            className={cn("w-full gap-2", isCollapsed ? 'justify-center' : 'justify-start')}
          >
            <Link href={href}>
              <Icon className="h-5 w-5" />
              <span className={cn(isCollapsed && 'sr-only')}>{label}</span>
            </Link>
          </Button>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </li>
  );
}
