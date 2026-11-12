'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface CheckinSummaryCardProps {
  positiveCheckInsToday: number;
  negativeCheckInsToday: number;
}

export function CheckinSummaryCard({ positiveCheckInsToday, negativeCheckInsToday }: CheckinSummaryCardProps) {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">Daily Check-ins</CardTitle>
            <CardDescription>A summary of your check-ins today.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-around items-center text-center">
                <div>
                    <p className="font-medium text-sm text-muted-foreground">Positive</p>
                    <div className="flex items-center gap-2 justify-center mt-1">
                        <TrendingUp className="h-6 w-6 text-green-500" />
                        <span className="text-3xl font-bold">{positiveCheckInsToday}</span>
                    </div>
                </div>
                <div>
                    <p className="font-medium text-sm text-muted-foreground">Negative</p>
                    <div className="flex items-center gap-2 justify-center mt-1">
                        <TrendingDown className="h-6 w-6 text-red-500" />
                        <span className="text-3xl font-bold">{negativeCheckInsToday}</span>
                    </div>
                </div>
            </div>
             <Button asChild variant="outline" className="w-full">
                <Link href="/check-ins">Add a Check-in <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
        </CardContent>
    </Card>
  );
}
