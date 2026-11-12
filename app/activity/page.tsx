'use client';

import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity as ActivityIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ActivityIconComponent } from '@/components/activity-icon';
import type { Activity } from '@/lib/types';

function ActivityItem({ activity, index }: { activity: Activity; index: number }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="relative flex items-start gap-4"
    >
      <div className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-4 ring-background">
        <ActivityIconComponent type={activity.type} />
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-sm font-medium">{activity.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
      {activity.link && (
        <Button asChild variant="ghost" size="icon">
          <Link href={activity.link}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </motion.li>
  );
}


export default function ActivityPage() {
  const { activities } = useTimeStore();

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>A log of your recent activities in the app.</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
              <ActivityIcon className="h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium">No activity yet.</p>
              <p className="text-sm">Start working on tasks or creating notes to see your timeline.</p>
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
              <ul className="space-y-8">
                <AnimatePresence>
                  {activities.map((activity, index) => (
                    <ActivityItem key={activity.id} activity={activity} index={index} />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
