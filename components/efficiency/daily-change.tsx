'use client';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DailyChangeProps {
  change: number;
  type: 'work' | 'personal';
}

export function DailyChange({ change, type }: DailyChangeProps) {
    const isIncrease = change > 0.1;
    const isDecrease = change < -0.1;
    const colorClass = 
        type === 'work' ? (isIncrease ? 'text-green-500' : isDecrease ? 'text-red-500' : 'text-muted-foreground') :
        (isIncrease ? 'text-green-500' : isDecrease ? 'text-red-500' : 'text-muted-foreground');

    return (
        <span className={cn('text-xs font-semibold flex items-center justify-center', colorClass)}>
            {isIncrease && <TrendingUp className="h-3 w-3 mr-1" />}
            {isDecrease && <TrendingDown className="h-3 w-3 mr-1" />}
            {change.toFixed(1)}%
        </span>
    )
}
