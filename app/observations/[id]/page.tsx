'use client';

import { useParams } from 'next/navigation';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function ObservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { observations } = useTimeStore();

  const observation = observations.find(o => o.id === id);

  if (!observation) {
    return (
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Observation not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The observation you are looking for does not exist.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/observations">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Observations
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8">
       <Button asChild variant="outline" className="mb-4">
          <Link href="/observations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Observations
          </Link>
        </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{observation.title}</CardTitle>
          <CardDescription>
            Created on {format(new Date(observation.createdAt), "PPP 'at' p")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 text-lg">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{observation.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground">Type</h4>
                <p className="font-medium">{observation.type}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground">Category</h4>
                <p className="font-medium">{observation.category}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Details</h3>
             <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold">Tags:</h4>
                {observation.tags.map(tag => (
                    <div key={tag} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                        # {tag}
                    </div>
                ))}
            </div>
          </div>

        </CardContent>
      </Card>
    </main>
  );
}

export default ObservationDetailPage;
