
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CheckIn } from '@/lib/types';
import { MessageSquare, TrendingDown, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, subValue, icon }: { title: string; value: string | number; subValue?: string; icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
    </CardContent>
  </Card>
);

interface CheckInStatCardsProps {
    filteredCheckIns: CheckIn[];
}

export function CheckInStatCards({ filteredCheckIns }: CheckInStatCardsProps) {
    const stats = useMemo(() => {
        const totalCheckIns = filteredCheckIns.length;
        const positiveCheckIns = filteredCheckIns.filter(c => c.type === 'positive');
        const negativeCheckIns = filteredCheckIns.filter(c => c.type === 'negative');
        
        const positiveCount = positiveCheckIns.length;
        const negativeCount = negativeCheckIns.length;
        
        const avgPositiveRating = positiveCount > 0 ? (positiveCheckIns.reduce((acc, c) => acc + c.rating, 0) / positiveCount).toFixed(1) : 'N/A';
        const avgNegativeRating = negativeCount > 0 ? (negativeCheckIns.reduce((acc, c) => acc + c.rating, 0) / negativeCount).toFixed(1) : 'N/A';
        
        return {
          totalCheckIns,
          positiveCount,
          negativeCount,
          avgPositiveRating,
          avgNegativeRating,
        };
      }, [filteredCheckIns]);

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Total Check-ins" value={stats.totalCheckIns} icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Positive" value={stats.positiveCount} subValue={`Avg rating: ${stats.avgPositiveRating}`} icon={<TrendingUp className="h-4 w-4 text-green-500" />} />
            <StatCard title="Negative" value={stats.negativeCount} subValue={`Avg rating: ${stats.avgNegativeRating}`} icon={<TrendingDown className="h-4 w-4 text-red-500" />} />
        </div>
    );
}
