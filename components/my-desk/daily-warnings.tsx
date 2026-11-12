'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import type { DailyWarning } from '@/lib/types';

interface DailyWarningsProps {
  warnings: DailyWarning[];
}

export function DailyWarnings({ warnings }: DailyWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <Card className="border-amber-500/50 bg-amber-500/5">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400"><AlertTriangle className="h-5 w-5" /> Daily Warnings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {warnings.map((warning, index) => (
                <div key={index} className="p-3 bg-amber-500/10 rounded-lg">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-300">{warning.message}</h4>
                    <p className="text-sm text-amber-600 dark:text-amber-400">{warning.details}</p>
                </div>
            ))}
        </CardContent>
    </Card>
  );
}
