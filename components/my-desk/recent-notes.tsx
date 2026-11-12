
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Notebook, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Note } from '@/lib/types';
import { useMemo } from 'react';
import { startOfWeek, isWithinInterval } from 'date-fns';

interface RecentNotesProps {
    notes: Note[];
}

export function RecentNotes({ notes }: RecentNotesProps) {
    const recentNotes = useMemo(() => {
        const now = new Date();
        const oneWeekAgo = startOfWeek(now, { weekStartsOn: 1 });
        return notes
          .filter(note => isWithinInterval(new Date(note.createdAt), { start: oneWeekAgo, end: now }))
          .slice(0, 5);
    }, [notes]);

    return (
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><Notebook className="h-5 w-5" /> Recent Notes</CardTitle>
            <CardDescription>Notes created this week.</CardDescription>
            </CardHeader>
            <CardContent>
            {recentNotes.length > 0 ? (
                <ul className="space-y-3">
                {recentNotes.map(note => (
                    <li key={note.id} className="border-b pb-2 last:border-b-0">
                    <Link href={`/notes/${note.id}`} className="group">
                        <h5 className="font-medium group-hover:text-primary transition-colors">{note.title}</h5>
                        <p className="text-xs text-muted-foreground line-clamp-1">{note.description}</p>
                    </Link>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No notes created this week.</p>
            )}
            </CardContent>
            {recentNotes.length > 0 && (
                <CardContent>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/notes">View All Notes <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </CardContent>
            )}
        </Card>
    );
}
