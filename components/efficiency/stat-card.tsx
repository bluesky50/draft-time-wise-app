'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    description?: string;
    change?: string;
    changeType?: 'increase' | 'decrease' | 'neutral';
    progress?: number;
    totalDuration?: string;
}

export function StatCard({ title, value, icon, description, change, changeType, progress, totalDuration }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
                 {change && (
                    <div className='flex items-center gap-1 text-xs text-muted-foreground mt-1'>
                        {changeType === 'increase' && <ArrowUp className='h-4 w-4 text-green-500' />}
                        {changeType === 'decrease' && <ArrowDown className='h-4 w-4 text-red-500' />}
                        {changeType === 'neutral' && <ArrowRight className='h-4 w-4' />}
                        <span className={cn(
                            changeType === 'increase' && 'text-green-500',
                            changeType === 'decrease' && 'text-red-500',
                        )}>{change}</span>
                        <span>vs start of week</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
