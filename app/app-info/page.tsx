'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, GitCommit, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
            {icon}
            <h4 className="font-semibold text-sm text-muted-foreground">{title}</h4>
        </div>
        <p className="font-mono text-sm font-medium break-all">{value || 'N/A'}</p>
    </div>
);


export default function AppInfoPage() {
    const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE;
    const formattedBuildDate = buildDate ? format(new Date(buildDate), "PPP 'at' p") : 'N/A';

    return (
        <main className="flex-1 container mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-6 w-6" />
                        App Info
                    </CardTitle>
                    <CardDescription>
                        Information about the current application build and deployment.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                   <StatCard 
                        title="Commit Hash"
                        value={process.env.NEXT_PUBLIC_COMMIT_HASH || 'Unknown'}
                        icon={<GitCommit className="h-4 w-4 text-muted-foreground" />}
                   />
                   <StatCard 
                        title="Build Date"
                        value={formattedBuildDate}
                        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                   />
                </CardContent>
            </Card>
        </main>
    );
}
